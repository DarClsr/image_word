/**
 * 队列服务
 */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';

export interface ImageGenerationJob {
  taskId: string;
  userId: number;
  prompt: string;
  negativePrompt?: string;
  styleId: number;
  styleName: string;
  modelId: number;
  modelName: string;
  params: {
    width: number;
    height: number;
    steps?: number;
    guidance?: number;
    seed?: number;
  };
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('image-generation')
    private imageQueue: Queue<ImageGenerationJob>,
  ) {}

  /**
   * 添加图片生成任务
   */
  async addImageGenerationJob(data: ImageGenerationJob): Promise<Job<ImageGenerationJob>> {
    return this.imageQueue.add('generate', data, {
      priority: this.getJobPriority(data),
      jobId: data.taskId,
    });
  }

  /**
   * 获取队列状态
   */
  async getQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.imageQueue.getWaitingCount(),
      this.imageQueue.getActiveCount(),
      this.imageQueue.getCompletedCount(),
      this.imageQueue.getFailedCount(),
      this.imageQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  /**
   * 获取任务信息
   */
  async getJob(taskId: string): Promise<Job<ImageGenerationJob> | null> {
    return this.imageQueue.getJob(taskId);
  }

  /**
   * 取消任务
   */
  async cancelJob(taskId: string): Promise<boolean> {
    const job = await this.imageQueue.getJob(taskId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  }

  /**
   * 根据用户会员类型确定优先级
   */
  private getJobPriority(data: ImageGenerationJob): number {
    // TODO: 根据用户会员类型设置优先级
    // Pro 用户优先级高（数字越小优先级越高）
    return 10;
  }
}
