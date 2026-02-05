/**
 * 作品服务
 */
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { ErrorCodes } from '../../common/filters/http-exception.filter';
import { CreateWorksInput, QueryWorksInput, AuditWorksInput, BatchAuditWorksInput } from './schemas/works.schema';
import { generateUUID } from '../../utils/crypto.util';

@Injectable()
export class WorksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  /**
   * 创建作品（实际创建生成任务）
   */
  async create(dto: CreateWorksInput, userId: number) {
    // 检查用户额度
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.usedQuota >= user.totalQuota) {
      throw new BadRequestException({
        code: ErrorCodes.QUOTA_EXCEEDED,
        message: '生成额度不足',
      });
    }

    // 验证分类存在且启用
    const [style, model] = await Promise.all([
      this.prisma.category.findFirst({
        where: { id: dto.styleId, type: 'style', status: 1 },
      }),
      this.prisma.category.findFirst({
        where: { id: dto.modelId, type: 'model', status: 1 },
      }),
    ]);

    if (!style) {
      throw new BadRequestException('风格不存在或已禁用');
    }
    if (!model) {
      throw new BadRequestException('模型不存在或已禁用');
    }

    // 使用事务创建任务并扣减额度
    const result = await this.prisma.$transaction(async (tx) => {
      // 扣减额度
      await tx.user.update({
        where: { id: userId },
        data: { usedQuota: { increment: 1 } },
      });

      // 创建任务
      const task = await tx.task.create({
        data: {
          taskId: generateUUID(),
          userId,
          type: 'text2img',
          status: 'pending',
          params: {
            ...dto,
            styleName: style.name,
            modelName: model.name,
          },
        },
      });

      return task;
    });

    // 将任务加入 BullMQ 队列
    try {
      const params = {
        width: dto.params?.width ?? 1024,
        height: dto.params?.height ?? 1024,
        steps: dto.params?.steps,
        guidance: dto.params?.guidance,
        seed: dto.params?.seed,
      };

      await this.queueService.addImageGenerationJob({
        taskId: result.taskId,
        userId,
        prompt: dto.prompt,
        negativePrompt: dto.negativePrompt,
        styleId: dto.styleId,
        styleName: style.name,
        modelId: dto.modelId,
        modelName: model.name,
        params,
      });
    } catch (error) {
      // 入队失败则回滚额度并标记任务失败
      await this.prisma.$transaction(async (tx) => {
        await tx.task.update({
          where: { taskId: result.taskId },
          data: { status: 'failed', errorMsg: '任务入队失败' },
        });
        await tx.user.update({
          where: { id: userId },
          data: { usedQuota: { decrement: 1 } },
        });
      });
      throw error;
    }

    return {
      taskId: result.taskId,
      status: result.status,
      message: '任务已提交，请等待生成完成',
    };
  }

  /**
   * 查询用户自己的作品
   */
  async findByUser(userId: number, query: QueryWorksInput) {
    const { page, pageSize, styleId, status } = query;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { userId };
    if (styleId) where.styleId = styleId;
    if (status) where.status = status;

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

  /**
   * 查询公开作品（广场）
   */
  async findPublic(query: QueryWorksInput) {
    const { page, pageSize, styleId, keyword } = query;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {
      isPublic: true,
      status: 'approved',
    };
    if (styleId) where.styleId = styleId;
    if (keyword) {
      where.prompt = { contains: keyword, mode: 'insensitive' };
    }

    const [list, total] = await Promise.all([
      this.prisma.works.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
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

  /**
   * 查询所有作品（管理端）
   */
  async findAll(query: QueryWorksInput) {
    const { page, pageSize, styleId, modelId, status, isPublic, userId, keyword, startDate, endDate } = query;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (styleId) where.styleId = styleId;
    if (modelId) where.modelId = modelId;
    if (status) where.status = status;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (userId) where.userId = userId;
    if (keyword) {
      where.prompt = { contains: keyword, mode: 'insensitive' };
    }
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
          user: { select: { id: true, nickname: true, avatar: true } },
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

  /**
   * 获取作品详情
   */
  async findOne(id: number, userId?: number) {
    const works = await this.prisma.works.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        style: { select: { id: true, name: true } },
        model: { select: { id: true, name: true } },
      },
    });

    if (!works) {
      throw new NotFoundException('作品不存在');
    }

    // 如果不是作品所有者，只能查看已公开的作品
    if (userId && works.userId !== userId && !works.isPublic) {
      throw new ForbiddenException('无权查看此作品');
    }

    // 增加浏览量
    await this.prisma.works.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return works;
  }

  /**
   * 删除作品
   */
  async remove(id: number, userId: number) {
    const works = await this.prisma.works.findUnique({
      where: { id },
    });

    if (!works) {
      throw new NotFoundException('作品不存在');
    }

    if (works.userId !== userId) {
      throw new ForbiddenException('无权删除此作品');
    }

    return this.prisma.works.delete({ where: { id } });
  }

  /**
   * 管理员删除作品
   */
  async adminRemove(id: number, adminId: number) {
    const works = await this.prisma.works.findUnique({
      where: { id },
    });

    if (!works) {
      throw new NotFoundException('作品不存在');
    }

    await this.prisma.$transaction([
      this.prisma.works.delete({ where: { id } }),
      this.prisma.auditLog.create({
        data: {
          adminId,
          action: 'delete',
          module: 'works',
          targetId: id,
          targetType: 'works',
          oldValue: works,
          ip: '',
        },
      }),
    ]);

    return { success: true };
  }

  /**
   * 审核作品
   */
  async audit(id: number, dto: AuditWorksInput, adminId: number) {
    const works = await this.prisma.works.findUnique({
      where: { id },
    });

    if (!works) {
      throw new NotFoundException('作品不存在');
    }

    const updatedWorks = await this.prisma.works.update({
      where: { id },
      data: {
        status: dto.status,
        auditReason: dto.reason,
        auditedAt: new Date(),
        auditedBy: adminId,
      },
    });

    // 记录审计日志
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'audit',
        module: 'works',
        targetId: id,
        targetType: 'works',
        oldValue: { status: works.status },
        newValue: { status: dto.status, reason: dto.reason },
        ip: '',
      },
    });

    return updatedWorks;
  }

  /**
   * 批量审核
   */
  async batchAudit(dto: BatchAuditWorksInput, adminId: number) {
    const { ids, status, reason } = dto;

    const result = await this.prisma.works.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        auditReason: reason,
        auditedAt: new Date(),
        auditedBy: adminId,
      },
    });

    // 记录审计日志
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'batch_audit',
        module: 'works',
        newValue: { ids, status, reason },
        ip: '',
      },
    });

    return { success: true, count: result.count };
  }
}
