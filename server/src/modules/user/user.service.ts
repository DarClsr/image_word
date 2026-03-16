/**
 * 用户服务
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { maskPhone } from '../../utils/mask.util';
import { QueryUserInput, UpdateQuotaInput, UpdateMemberInput } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查询用户列表（管理端�?
   */
  async findAll(query: QueryUserInput) {
    const { page, pageSize, keyword, memberType, status, startDate, endDate } = query;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (keyword) {
      where.OR = [
        { nickname: { contains: keyword, mode: 'insensitive' } },
        { phone: { contains: keyword } },
      ];
    }
    if (memberType) {
      where.memberType = memberType;
    }
    if (status !== undefined) {
      where.status = status;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nickname: true,
          avatar: true,
          phone: true,
          gender: true,
          memberType: true,
          memberExpireAt: true,
          totalQuota: true,
          usedQuota: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: { works: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // 脱敏处理
    const maskedList = list.map((user) => ({
      ...user,
      phone: maskPhone(user.phone),
      remainQuota: user.totalQuota - user.usedQuota,
      worksCount: user._count.works,
    }));

    return {
      list: maskedList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取用户详情
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { works: true, tasks: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      ...user,
      phone: maskPhone(user.phone),
      remainQuota: user.totalQuota - user.usedQuota,
      worksCount: user._count.works,
      tasksCount: user._count.tasks,
    };
  }

  /**
   * 获取用户统计数据
   */
  async getStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { works: true },
        },
        works: {
          select: {
            viewCount: true,
            likeCount: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const totalViews = user.works.reduce((sum, w) => sum + w.viewCount, 0);
    const totalLikes = user.works.reduce((sum, w) => sum + w.likeCount, 0);

    return {
      works: user._count.works,
      views: totalViews,
      likes: totalLikes,
      remainQuota: user.totalQuota - user.usedQuota,
    };
  }

  /**
   * 调整用户额度
   */
  async updateQuota(id: number, dto: UpdateQuotaInput, adminId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('�û�������');
    }

    const newQuota = user.totalQuota + dto.amount;
    if (newQuota < user.usedQuota) {
      throw new BadRequestException('�¶�Ȳ���С����ʹ�ö��');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { totalQuota: newQuota },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'update',
        module: 'user',
        targetId: id,
        targetType: 'quota',
        oldValue: { totalQuota: user.totalQuota },
        newValue: { totalQuota: newQuota, amount: dto.amount, reason: dto.reason },
        ip: '',
      },
    });

    return {
      ...updatedUser,
      remainQuota: updatedUser.totalQuota - updatedUser.usedQuota,
    };
  }

  /**
   * ������Ա
   */
  async updateMember(id: number, dto: UpdateMemberInput, adminId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('�û�������');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        memberType: dto.memberType,
        memberExpireAt: dto.expireAt ? new Date(dto.expireAt) : null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'update',
        module: 'user',
        targetId: id,
        targetType: 'member',
        oldValue: { memberType: user.memberType, memberExpireAt: user.memberExpireAt },
        newValue: { memberType: dto.memberType, memberExpireAt: dto.expireAt, reason: dto.reason },
        ip: '',
      },
    });

    return updatedUser;
  }

  /**
   * ��ȡ�û���Ʒ
   */
  async getUserWorks(userId: number, query: { page: number; pageSize: number; status?: string; startDate?: string; endDate?: string; styleId?: number; modelId?: number; keyword?: string }) {
    const { page, pageSize, status, startDate, endDate, styleId, modelId, keyword } = query;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    if (styleId) where.styleId = styleId;
    if (modelId) where.modelId = modelId;
    if (keyword) where.prompt = { contains: keyword, mode: 'insensitive' };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const [list, total] = await Promise.all([
      this.prisma.works.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          style: { select: { id: true, name: true } },
          model: { select: { id: true, name: true } },
        },
      }),
      this.prisma.works.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async ban(id: number, reason: string | undefined, adminId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.status === 0) {
      throw new BadRequestException('用户已被封禁');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status: 0 },
    });

    // 记录审计日志
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'ban',
        module: 'user',
        targetId: id,
        targetType: 'user',
        oldValue: { status: 1 },
        newValue: { status: 0, reason },
        ip: '',
      },
    });

    return updatedUser;
  }

  /**
   * 解封用户
   */
  async unban(id: number, adminId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.status === 1) {
      throw new BadRequestException('用户未被封禁');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status: 1 },
    });

    // 记录审计日志
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'unban',
        module: 'user',
        targetId: id,
        targetType: 'user',
        oldValue: { status: 0 },
        newValue: { status: 1 },
        ip: '',
      },
    });

    return updatedUser;
  }
}




