/**
 * 图片生成任务处理器
 */
import { Process, Processor, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AppLoggerService } from '../../../shared/logger/logger.service';
import { ImageGenerationJob } from '../queue.service';

@Processor('image-generation')
export class ImageGenerationProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * 处理图片生成任务
   */
  @Process('generate')
  async handleGenerate(job: Job<ImageGenerationJob>) {
    const { taskId, userId, prompt, styleName, modelName, params } = job.data;

    this.logger.log(`开始处理任务: ${taskId}`, 'ImageGenerationProcessor');

    try {
      // 1. 更新任务状态为处理中
      await this.prisma.task.update({
        where: { taskId },
        data: {
          status: 'processing',
          startedAt: new Date(),
        },
      });

      // 2. 调用 AI 服务生成图片
      // TODO: 实际调用 AI 服务 API
      // const result = await this.aiService.generateImage({
      //   prompt,
      //   negative_prompt: job.data.negativePrompt,
      //   style: styleName,
      //   model: modelName,
      //   width: params.width,
      //   height: params.height,
      //   steps: params.steps,
      //   guidance: params.guidance,
      //   seed: params.seed,
      // });

      // 模拟生成过程
      await this.simulateGeneration(job);

      // 3. 模拟结果
      const mockResult = {
        imageUrl: `https://storage.example.com/images/${taskId}.png`,
        thumbnailUrl: `https://storage.example.com/thumbnails/${taskId}.png`,
        width: params.width,
        height: params.height,
        seed: params.seed || Math.floor(Math.random() * 1000000),
      };

      // 4. 创建作品记录
      const works = await this.prisma.works.create({
        data: {
          userId,
          prompt,
          negativePrompt: job.data.negativePrompt,
          styleId: job.data.styleId,
          modelId: job.data.modelId,
          imageUrl: mockResult.imageUrl,
          thumbnailUrl: mockResult.thumbnailUrl,
          width: mockResult.width,
          height: mockResult.height,
          params: { ...params, seed: mockResult.seed },
          status: 'pending', // 等待审核
        },
      });

      // 5. 更新任务状态为完成
      await this.prisma.task.update({
        where: { taskId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          result: mockResult,
          worksId: works.id,
        },
      });

      this.logger.log(`任务完成: ${taskId}`, 'ImageGenerationProcessor');

      return { success: true, worksId: works.id };
    } catch (error) {
      this.logger.error(`任务失败: ${taskId} - ${error}`, undefined, 'ImageGenerationProcessor');
      throw error;
    }
  }

  /**
   * 任务失败处理
   */
  @OnQueueFailed()
  async handleFailed(job: Job<ImageGenerationJob>, error: Error) {
    const { taskId, userId } = job.data;

    this.logger.error(
      `任务失败: ${taskId} - ${error.message}`,
      error.stack,
      'ImageGenerationProcessor',
    );

    // 更新任务状态
    await this.prisma.task.update({
      where: { taskId },
      data: {
        status: 'failed',
        errorMsg: error.message,
        retryCount: job.attemptsMade,
      },
    });

    // 如果最终失败，恢复用户额度
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { usedQuota: { decrement: 1 } },
      });
    }
  }

  /**
   * 任务完成处理
   */
  @OnQueueCompleted()
  handleCompleted(job: Job<ImageGenerationJob>) {
    this.logger.log(`任务完成回调: ${job.data.taskId}`, 'ImageGenerationProcessor');
  }

  /**
   * 模拟生成过程（开发用）
   */
  private async simulateGeneration(job: Job<ImageGenerationJob>): Promise<void> {
    const totalSteps = 10;
    for (let i = 0; i < totalSteps; i++) {
      // 更新进度
      await job.progress(((i + 1) / totalSteps) * 100);
      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
