/**
 * 图文生成 API 控制器
 */
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ImageTextService } from '../services/image-text.service';
import { ClientAuthGuard } from '../../../common/guards';
import { Public } from '../../../common/decorators';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { z } from 'zod';

/**
 * 生成图文 Schema
 */
const GenerateImageTextSchema = z.object({
  topic: z.string().min(2, '主题至少2个字').max(100, '主题最多100字'),
  template: z.enum(['quote', 'tips', 'list', 'story', 'knowledge', 'poster', 'card']),
  style: z.enum(['xiaohongshu', 'minimal', 'gradient', 'magazine', 'retro', 'cute']).optional(),
  ratio: z.enum(['1:1', '3:4', '4:3', '9:16']).optional(),
  model: z.string().max(50).optional(),
});

type GenerateImageTextInput = z.infer<typeof GenerateImageTextSchema>;

@Controller('client/image-text')
@UseGuards(ClientAuthGuard)
export class ImageTextController {
  constructor(private readonly imageTextService: ImageTextService) {}

  /**
   * AI 生成图文
   * @description 使用 AI 直接生成带文字的小红书风格图片
   */
  @Post('generate')
  async generate(
    @Body(new ZodValidationPipe(GenerateImageTextSchema)) dto: GenerateImageTextInput,
  ) {
    return this.imageTextService.generateImageText(dto);
  }

  /**
   * 获取模板列表
   */
  @Public()
  @Get('templates')
  getTemplates() {
    return this.imageTextService.getTemplates();
  }

  /**
   * 获取风格列表
   */
  @Public()
  @Get('styles')
  getStyles() {
    return this.imageTextService.getStyles();
  }

  /**
   * 获取可用的 AI 模型
   */
  @Public()
  @Get('models')
  getModels() {
    return this.imageTextService.getModels();
  }
}
