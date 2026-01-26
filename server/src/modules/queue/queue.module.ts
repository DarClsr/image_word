/**
 * 任务队列模块
 */
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { ImageGenerationProcessor } from './processors/image-generation.processor';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: configService.get<string>('REDIS_URL'),
      }),
    }),
    BullModule.registerQueue({
      name: 'image-generation',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    }),
  ],
  providers: [ImageGenerationProcessor, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
