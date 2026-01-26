/**
 * 用户服务
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { maskPhone } from '../../utils/mask.util';
import { QueryUserInput, UpdateQuotaInput } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查询用户列表（管理端）
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
      throw new NotFoundException('用户不存在');
    }

    // 如果新额度小于已用额度，需要特殊处理
    if (dto.quota < user.usedQuota) {
      throw new BadRequestException('新额度不能小于已使用额度');
    }

    const oldQuota = user.totalQuota;

    // 更新额度
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { totalQuota: dto.quota },
    });

    // 记录审计日志
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'update',
        module: 'user',
        targetId: id,
        targetType: 'quota',
        oldValue: { totalQuota: oldQuota },
        newValue: { totalQuota: dto.quota, reason: dto.reason },
        ip: '',
      },
    });

    return {
      ...updatedUser,
      remainQuota: updatedUser.totalQuota - updatedUser.usedQuota,
    };
  }

  /**
   * 封禁用户
   */
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
