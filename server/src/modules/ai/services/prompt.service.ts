/**
 * 提示词服务 - AI 扩展与优化
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 扩展提示词的输入
 */
interface ExpandPromptInput {
  /** 用户原始输入 */
  text: string;
  /** 风格（可选） */
  style?: string;
  /** 语言：zh/en */
  language?: 'zh' | 'en';
}

/**
 * 扩展结果
 */
export interface ExpandPromptResult {
  /** 扩展后的中文提示词 */
  promptZh: string;
  /** 扩展后的英文提示词（用于模型） */
  promptEn: string;
  /** 推荐的负面提示词 */
  negativePrompt: string;
  /** 推荐的风格标签 */
  tags: string[];
}

@Injectable()
export class PromptService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    // 支持多种 LLM 配置
    this.apiKey = this.configService.get<string>('LLM_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('LLM_API_URL') || 'https://api.deepseek.com/v1';
    this.model = this.configService.get<string>('LLM_MODEL') || 'deepseek-chat';
  }

  /**
   * 扩展提示词
   */
  async expandPrompt(input: ExpandPromptInput): Promise<ExpandPromptResult> {
    const { text, style, language = 'zh' } = input;

    if (!text || text.trim().length < 2) {
      throw new BadRequestException('请输入至少2个字符的描述');
    }

    const systemPrompt = this.buildSystemPrompt(style);
    const userPrompt = this.buildUserPrompt(text, style, language);

    try {
      const response = await this.callLLM(systemPrompt, userPrompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('LLM 调用失败:', error);
      // 降级处理：返回简单扩展
      return this.fallbackExpand(text, style);
    }
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(style?: string): string {
    return `你是一个专业的AI绘画提示词专家。你的任务是将用户的简短描述扩展成详细的、适合AI绘画的提示词。

要求：
1. 保持用户原意，但添加更多细节（光影、构图、氛围、材质等）
2. 生成中英文两个版本，英文版用于模型输入
3. 提供合适的负面提示词
4. 推荐相关的风格标签

${style ? `当前选择的风格是：${style}，请在扩展时融入该风格特点。` : ''}

请严格按照以下JSON格式返回：
{
  "promptZh": "扩展后的中文提示词",
  "promptEn": "expanded English prompt for AI model",
  "negativePrompt": "negative prompt in English",
  "tags": ["tag1", "tag2", "tag3"]
}`;
  }

  /**
   * 构建用户提示词
   */
  private buildUserPrompt(text: string, style?: string, language?: string): string {
    let prompt = `请扩展以下描述：\n\n"${text}"`;
    if (style) {
      prompt += `\n\n风格要求：${style}`;
    }
    return prompt;
  }

  /**
   * 调用 LLM API
   */
  private async callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * 解析 LLM 返回
   */
  private parseResponse(response: string): ExpandPromptResult {
    try {
      const parsed = JSON.parse(response);
      return {
        promptZh: parsed.promptZh || '',
        promptEn: parsed.promptEn || '',
        negativePrompt: parsed.negativePrompt || this.getDefaultNegativePrompt(),
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      };
    } catch {
      throw new Error('解析 LLM 响应失败');
    }
  }

  /**
   * 降级处理：简单扩展
   */
  private fallbackExpand(text: string, style?: string): ExpandPromptResult {
    const styleEnhance: Record<string, string> = {
      '国风': 'Chinese traditional style, ink painting, elegant',
      '写实': 'photorealistic, 8k, detailed, high quality',
      '动漫': 'anime style, vibrant colors, detailed illustration',
      '赛博': 'cyberpunk, neon lights, futuristic, sci-fi',
      '插画': 'illustration, flat design, clean lines',
      '极简': 'minimalist, simple, clean, modern design',
    };

    const enhance = style && styleEnhance[style] ? styleEnhance[style] : 'high quality, detailed';

    return {
      promptZh: text,
      promptEn: `${text}, ${enhance}, masterpiece, best quality`,
      negativePrompt: this.getDefaultNegativePrompt(),
      tags: style ? [style] : [],
    };
  }

  /**
   * 默认负面提示词
   */
  private getDefaultNegativePrompt(): string {
    return 'low quality, blurry, distorted, deformed, ugly, bad anatomy, watermark, text, signature, cropped, out of frame';
  }

  /**
   * 优化已有提示词
   */
  async optimizePrompt(prompt: string, style?: string): Promise<ExpandPromptResult> {
    const systemPrompt = `你是一个AI绘画提示词优化专家。请优化以下提示词，使其更适合AI绘画模型。
保持原意，但：
1. 调整词序，将重要元素放前面
2. 添加必要的质量词和风格词
3. 确保语法正确

${style ? `风格：${style}` : ''}

返回JSON格式：
{
  "promptZh": "优化后的中文",
  "promptEn": "optimized English prompt",
  "negativePrompt": "negative prompt",
  "tags": ["tag1", "tag2"]
}`;

    try {
      const response = await this.callLLM(systemPrompt, prompt);
      return this.parseResponse(response);
    } catch {
      return this.fallbackExpand(prompt, style);
    }
  }

  /**
   * 根据图片生成提示词（图生文）
   */
  async imageToPrompt(imageUrl: string): Promise<string> {
    // TODO: 接入视觉模型（如 GPT-4V、Qwen-VL 等）
    throw new BadRequestException('图生文功能开发中');
  }
}
