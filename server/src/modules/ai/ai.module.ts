/**
 * AI 服务模块
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { RedisModule } from '../../shared/redis/redis.module';
import { PromptService } from './services/prompt.service';
import { ImageTextService } from './services/image-text.service';
import { GenerationConfigService } from './services/generation-config.service';
import { PromptController } from './controllers/prompt.controller';
import { ImageTextController } from './controllers/image-text.controller';
import { GenerationConfigController, AdminGenerationConfigController } from './controllers/generation-config.controller';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [
    PromptController,
    ImageTextController,
    GenerationConfigController,
    AdminGenerationConfigController,
  ],
  providers: [PromptService, ImageTextService, GenerationConfigService],
  exports: [PromptService, ImageTextService, GenerationConfigService],
})
export class AiModule {}
