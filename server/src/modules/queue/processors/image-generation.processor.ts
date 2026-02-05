/**
 * 图片生成任务处理器
 */
import { Process, Processor, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AppLoggerService } from '../../../shared/logger/logger.service';
import { ImageGenerationJob } from '../queue.service';
import { AIModelService } from '../../ai/services/ai-model.service';
import { StorageService } from '../../storage/storage.service';

@Processor('image-generation')
export class ImageGenerationProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
    private readonly aiModelService: AIModelService,
    private readonly storageService: StorageService,
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

      await job.progress(10);

      // 2. 调用 AI 服务生成图片
      const generation = await this.aiModelService.generateImage({
        prompt,
        negativePrompt: job.data.negativePrompt,
        width: params.width,
        height: params.height,
        steps: params.steps,
        guidance: params.guidance,
        seed: params.seed,
        model: modelName,
      });

      await job.progress(60);

      const seed = params.seed ?? Math.floor(Math.random() * 1000000);

      // 3. 上传到对象存储
      const [image, thumbnail] = await Promise.all([
        this.storageService.upload(generation.buffer, userId, generation.contentType),
        this.storageService.uploadThumbnail(generation.buffer, userId, generation.contentType),
      ]);

      await job.progress(80);

      // 4. 创建作品记录
      const works = await this.prisma.works.create({
        data: {
          userId,
          prompt,
          negativePrompt: job.data.negativePrompt,
          styleId: job.data.styleId,
          modelId: job.data.modelId,
          imageUrl: image.url,
          thumbnailUrl: thumbnail.url,
          width: params.width,
          height: params.height,
          params: { ...params, seed },
          status: 'pending',
        },
      });

      // 5. 更新任务状态为完成
      await this.prisma.task.update({
        where: { taskId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          result: {
            imageUrl: image.url,
            thumbnailUrl: thumbnail.url,
            width: params.width,
            height: params.height,
            seed,
          },
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

  // 模拟生成过程已移除，改为真实调用
}
