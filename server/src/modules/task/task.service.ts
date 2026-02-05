/**
 * 任务服务
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  /**
   * 查询任务状态
   */
  async getStatus(taskId: string, userId: number) {
    const task = await this.prisma.task.findUnique({
      where: { taskId },
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    // 验证权限
    if (task.userId !== userId) {
      throw new ForbiddenException('无权访问此任务');
    }

    // 计算队列位置（如果是等待中）
    let queuePosition: number | undefined;
    if (task.status === 'pending') {
      const pendingCount = await this.prisma.task.count({
        where: {
          status: 'pending',
          createdAt: { lt: task.createdAt },
        },
      });
      queuePosition = pendingCount + 1;
    }

    return {
      taskId: task.taskId,
      status: task.status,
      queuePosition,
      result: task.result,
      errorMsg: task.errorMsg,
      createdAt: task.createdAt,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
    };
  }

  /**
   * 取消任务
   */
  async cancel(taskId: string, userId: number) {
    const task = await this.prisma.task.findUnique({
      where: { taskId },
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    // 验证权限
    if (task.userId !== userId) {
      throw new ForbiddenException('无权取消此任务');
    }

    // 只能取消等待中的任务
    if (task.status !== 'pending') {
      throw new ForbiddenException('只能取消等待中的任务');
    }

    // 尝试从队列中移除任务
    await this.queueService.cancelJob(taskId);

    // 更新任务状态
    await this.prisma.task.update({
      where: { taskId },
      data: { status: 'failed', errorMsg: '用户取消' },
    });

    // 恢复用户额度
    await this.prisma.user.update({
      where: { id: userId },
      data: { usedQuota: { decrement: 1 } },
    });

    return { success: true, message: '任务已取消' };
  }

  /**
   * 获取用户任务列表
   */
  async findByUser(userId: number, status?: string) {
    const where: Record<string, unknown> = { userId };
    if (status) {
      where.status = status;
    }

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        taskId: true,
        type: true,
        status: true,
        result: true,
        errorMsg: true,
        createdAt: true,
        completedAt: true,
      },
    });
  }
}
