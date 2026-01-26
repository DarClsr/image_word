/**
 * 提示词 API 控制器
 */
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PromptService } from '../services/prompt.service';
import { ClientAuthGuard } from '../../../common/guards';
import { Public } from '../../../common/decorators';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { z } from 'zod';

/**
 * 扩展提示词 Schema
 */
const ExpandPromptSchema = z.object({
  text: z.string().min(2, '请输入至少2个字符').max(500, '描述最多500字'),
  style: z.string().optional(),
  language: z.enum(['zh', 'en']).default('zh'),
});

type ExpandPromptInput = z.infer<typeof ExpandPromptSchema>;

/**
 * 优化提示词 Schema
 */
const OptimizePromptSchema = z.object({
  prompt: z.string().min(1).max(2000),
  style: z.string().optional(),
});

type OptimizePromptInput = z.infer<typeof OptimizePromptSchema>;

@Controller('client/prompt')
@UseGuards(ClientAuthGuard)
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  /**
   * AI 扩展提示词
   * @description 将用户简短描述扩展成详细的绘画提示词
   */
  @Post('expand')
  async expandPrompt(
    @Body(new ZodValidationPipe(ExpandPromptSchema)) dto: ExpandPromptInput,
  ) {
    return this.promptService.expandPrompt(dto);
  }

  /**
   * 优化提示词
   * @description 优化已有的提示词，使其更适合 AI 绘画
   */
  @Post('optimize')
  async optimizePrompt(
    @Body(new ZodValidationPipe(OptimizePromptSchema)) dto: OptimizePromptInput,
  ) {
    return this.promptService.optimizePrompt(dto.prompt, dto.style);
  }
}
