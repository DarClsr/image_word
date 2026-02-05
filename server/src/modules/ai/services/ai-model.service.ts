/**
 * AI 模型服务 - 文生图/图生图统一入口
 */
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService } from '../../../shared/logger/logger.service';

export interface GenerateImageInput {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps?: number;
  guidance?: number;
  seed?: number;
  model?: string;
}

export interface GenerateImageResult {
  buffer: Buffer;
  contentType: string;
}

@Injectable()
export class AIModelService {
  private readonly aiServiceUrl?: string;
  private readonly aiServiceKey?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || undefined;
    this.aiServiceKey = this.configService.get<string>('AI_SERVICE_KEY') || undefined;
  }

  /**
   * 生成图片
   */
  async generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
    if (!this.aiServiceUrl) {
      this.logger.warn('AI_SERVICE_URL 未配置，使用占位图返回', 'AIModelService');
      return this.fetchPlaceholder();
    }

    const endpoint = this.aiServiceUrl.endsWith('/generate')
      ? this.aiServiceUrl
      : `${this.aiServiceUrl.replace(/\/+$/, '')}/generate`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.aiServiceKey ? { Authorization: `Bearer ${this.aiServiceKey}` } : {}),
      },
      body: JSON.stringify({
        prompt: input.prompt,
        negativePrompt: input.negativePrompt,
        width: input.width,
        height: input.height,
        steps: input.steps,
        guidance: input.guidance,
        seed: input.seed,
        model: input.model,
      }),
    });

    if (!response.ok) {
      this.logger.error(
        `AI 服务调用失败: ${response.status} ${response.statusText}`,
        undefined,
        'AIModelService',
      );
      throw new ServiceUnavailableException('AI 服务不可用');
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.startsWith('image/')) {
      const arrayBuffer = await response.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        contentType,
      };
    }

    const data = await response.json().catch(() => ({}));

    if (data?.imageBase64) {
      const base64 = String(data.imageBase64).replace(/^data:[^,]+,/, '');
      return {
        buffer: Buffer.from(base64, 'base64'),
        contentType: data?.contentType || 'image/png',
      };
    }

    if (data?.imageUrl) {
      return this.fetchImageUrl(String(data.imageUrl));
    }

    throw new ServiceUnavailableException('AI 服务返回格式不支持');
  }

  private async fetchImageUrl(url: string): Promise<GenerateImageResult> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new ServiceUnavailableException('AI 图片获取失败');
    }
    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType,
    };
  }

  private async fetchPlaceholder(): Promise<GenerateImageResult> {
    const url = 'https://placehold.co/1024x1024/667eea/ffffff?text=Image+Word';
    return this.fetchImageUrl(url);
  }
}
