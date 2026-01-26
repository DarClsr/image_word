/**
 * 图文生成服务 - AI 直接生成带文字的图片
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromptService } from './prompt.service';

/**
 * 图文生成输入
 */
interface ImageTextInput {
  /** 主题/关键词 */
  topic: string;
  /** 模板类型 */
  template: 'quote' | 'tips' | 'list' | 'story' | 'knowledge' | 'poster' | 'card';
  /** 风格 */
  style?: 'xiaohongshu' | 'minimal' | 'gradient' | 'magazine' | 'retro' | 'cute';
  /** 色调 */
  colorScheme?: string;
  /** 图片比例 */
  ratio?: '1:1' | '3:4' | '4:3' | '9:16';
  /** 使用的模型 */
  model?: 'ideogram' | 'flux' | 'jimeng';
}

/**
 * 生成的文案内容
 */
interface GeneratedContent {
  /** 标题 */
  title: string;
  /** 副标题 */
  subtitle?: string;
  /** 正文内容（可能是列表或段落） */
  body: string | string[];
  /** 标签 */
  tags: string[];
}

/**
 * 图文生成结果
 */
interface ImageTextResult {
  /** 生成的文案 */
  content: GeneratedContent;
  /** AI 生成的图片 URL */
  imageUrl: string;
  /** 缩略图 URL */
  thumbnailUrl?: string;
  /** 生成时使用的提示词（可用于二次生成） */
  prompt: string;
  /** 任务 ID（用于轮询） */
  taskId?: string;
}

@Injectable()
export class ImageTextService {
  private readonly aiServiceUrl: string;
  private readonly aiServiceKey: string;

  constructor(
    private configService: ConfigService,
    private promptService: PromptService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || '';
    this.aiServiceKey = this.configService.get<string>('AI_SERVICE_KEY') || '';
  }

  /**
   * 生成图文 - AI 直接生成带文字的图片
   */
  async generateImageText(input: ImageTextInput): Promise<ImageTextResult> {
    const { topic, template, style = 'xiaohongshu', ratio = '3:4', model = 'ideogram' } = input;

    // 1. 用 LLM 生成文案
    const content = await this.generateContent(topic, template);

    // 2. 构建图文生成提示词（让 AI 生成带文字的图片）
    const imagePrompt = this.buildImageTextPrompt(content, template, style, ratio);

    // 3. 调用图像生成 AI（Ideogram/Flux/即梦）
    const imageUrl = await this.generateImage(imagePrompt, model, ratio);

    return {
      content,
      imageUrl,
      prompt: imagePrompt,
    };
  }

  /**
   * 构建图文生成提示词
   */
  private buildImageTextPrompt(
    content: GeneratedContent,
    template: string,
    style: string,
    ratio: string,
  ): string {
    // 风格描述
    const styleDescriptions: Record<string, string> = {
      xiaohongshu: 'Xiaohongshu style social media post, trendy, aesthetic, clean layout, modern Chinese design',
      minimal: 'minimalist design, clean white background, elegant typography, lots of whitespace',
      gradient: 'beautiful gradient background, modern typography, vibrant colors',
      magazine: 'magazine cover style, professional layout, editorial design',
      retro: 'retro vintage style, nostalgic colors, classic typography',
      cute: 'cute kawaii style, pastel colors, rounded elements, playful design',
    };

    // 模板布局描述
    const templateLayouts: Record<string, string> = {
      quote: 'centered inspirational quote design with decorative quotation marks',
      tips: 'numbered list layout with clear hierarchy, tips card design',
      list: 'checklist or bullet points layout, organized content',
      story: 'storytelling layout with title at top, body text below',
      knowledge: 'infographic style, educational content layout',
      poster: 'poster design with bold title, eye-catching visuals',
      card: 'social media card, compact information display',
    };

    // 比例对应尺寸描述
    const ratioDescriptions: Record<string, string> = {
      '1:1': 'square format',
      '3:4': 'portrait format, vertical layout',
      '4:3': 'landscape format, horizontal layout',
      '9:16': 'phone screen format, tall vertical layout',
    };

    // 构建完整提示词
    const title = content.title;
    const bodyText = Array.isArray(content.body) 
      ? content.body.slice(0, 5).join(', ') 
      : content.body.slice(0, 100);

    return `Create a ${styleDescriptions[style] || styleDescriptions.xiaohongshu}, ${templateLayouts[template] || 'social media post'}, ${ratioDescriptions[ratio] || 'portrait format'}.

The image should contain these exact text elements:
- Main title: "${title}"
${content.subtitle ? `- Subtitle: "${content.subtitle}"` : ''}
- Content: "${bodyText}"

Requirements:
- Text must be clearly readable and properly rendered
- Beautiful typography with good hierarchy
- Harmonious color scheme
- Professional graphic design quality
- Chinese text support if needed
- Modern social media aesthetic
- High quality, 4K resolution`;
  }

  /**
   * 调用图像生成 AI
   */
  private async generateImage(prompt: string, model: string, ratio: string): Promise<string> {
    // 根据不同模型调用不同的 API
    switch (model) {
      case 'ideogram':
        return this.callIdeogram(prompt, ratio);
      case 'flux':
        return this.callFlux(prompt, ratio);
      case 'jimeng':
        return this.callJimeng(prompt, ratio);
      default:
        return this.callIdeogram(prompt, ratio);
    }
  }

  /**
   * 调用 Ideogram API（最擅长文字渲染）
   */
  private async callIdeogram(prompt: string, ratio: string): Promise<string> {
    const apiKey = this.configService.get<string>('IDEOGRAM_API_KEY');
    
    if (!apiKey) {
      console.warn('IDEOGRAM_API_KEY not configured, returning placeholder');
      return this.getPlaceholderImage();
    }

    const aspectRatios: Record<string, string> = {
      '1:1': 'ASPECT_1_1',
      '3:4': 'ASPECT_3_4',
      '4:3': 'ASPECT_4_3',
      '9:16': 'ASPECT_9_16',
    };

    try {
      const response = await fetch('https://api.ideogram.ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': apiKey,
        },
        body: JSON.stringify({
          image_request: {
            prompt,
            aspect_ratio: aspectRatios[ratio] || 'ASPECT_3_4',
            model: 'V_2',
            magic_prompt_option: 'AUTO',
            style_type: 'DESIGN',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ideogram API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.[0]?.url || this.getPlaceholderImage();
    } catch (error) {
      console.error('Ideogram 调用失败:', error);
      return this.getPlaceholderImage();
    }
  }

  /**
   * 调用 Flux API
   */
  private async callFlux(prompt: string, ratio: string): Promise<string> {
    // Flux 通常通过 Replicate 或 FAL.ai 调用
    const apiKey = this.configService.get<string>('FLUX_API_KEY');
    
    if (!apiKey) {
      return this.getPlaceholderImage();
    }

    const dimensions: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '3:4': { width: 768, height: 1024 },
      '4:3': { width: 1024, height: 768 },
      '9:16': { width: 576, height: 1024 },
    };

    const size = dimensions[ratio] || dimensions['3:4'];

    try {
      // 使用 FAL.ai 的 Flux 接口
      const response = await fetch('https://fal.run/fal-ai/flux/dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          image_size: size,
          num_inference_steps: 28,
          guidance_scale: 3.5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Flux API error: ${response.status}`);
      }

      const data = await response.json();
      return data.images?.[0]?.url || this.getPlaceholderImage();
    } catch (error) {
      console.error('Flux 调用失败:', error);
      return this.getPlaceholderImage();
    }
  }

  /**
   * 调用即梦 API（字节跳动）
   */
  private async callJimeng(prompt: string, ratio: string): Promise<string> {
    const apiKey = this.configService.get<string>('JIMENG_API_KEY');
    
    if (!apiKey) {
      return this.getPlaceholderImage();
    }

    try {
      // 即梦 API（需要根据实际文档调整）
      const response = await fetch('https://api.jimeng.jianying.com/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: ratio,
          style: 'graphic_design',
        }),
      });

      if (!response.ok) {
        throw new Error(`Jimeng API error: ${response.status}`);
      }

      const data = await response.json();
      return data.result?.image_url || this.getPlaceholderImage();
    } catch (error) {
      console.error('即梦调用失败:', error);
      return this.getPlaceholderImage();
    }
  }

  /**
   * 占位图（API 未配置时使用）
   */
  private getPlaceholderImage(): string {
    return 'https://placehold.co/768x1024/667eea/ffffff?text=Image+Text';
  }

  /**
   * 生成文案内容
   */
  private async generateContent(topic: string, template: string): Promise<GeneratedContent> {
    const systemPrompt = this.getTemplatePrompt(template);
    
    const apiKey = this.configService.get<string>('LLM_API_KEY');
    const apiUrl = this.configService.get<string>('LLM_API_URL') || 'https://api.deepseek.com/v1';
    const model = this.configService.get<string>('LLM_MODEL') || 'deepseek-chat';

    try {
      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `主题：${topic}` },
          ],
          temperature: 0.8,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      return JSON.parse(content);
    } catch (error) {
      console.error('生成文案失败:', error);
      // 降级返回
      return this.getFallbackContent(topic, template);
    }
  }

  /**
   * 获取模板对应的系统提示词
   */
  private getTemplatePrompt(template: string): string {
    const prompts: Record<string, string> = {
      quote: `你是一个文案专家，擅长创作小红书风格的金句图文。
根据用户主题，生成一句有深度、有共鸣的金句。

返回JSON格式：
{
  "title": "主金句（15-30字）",
  "subtitle": "补充说明（可选，10-20字）",
  "body": "延伸解读（30-50字）",
  "tags": ["标签1", "标签2", "标签3"],
  "backgroundPrompt": "适合这个金句的背景图描述（英文，用于AI生图）"
}`,

      tips: `你是一个文案专家，擅长创作小红书风格的干货技巧图文。
根据用户主题，生成实用的技巧分享。

返回JSON格式：
{
  "title": "吸引人的标题（10-15字）",
  "subtitle": "副标题（可选）",
  "body": ["技巧1", "技巧2", "技巧3", "技巧4", "技巧5"],
  "tags": ["标签1", "标签2", "标签3"],
  "backgroundPrompt": "适合的背景图描述（英文）"
}`,

      list: `你是一个文案专家，擅长创作小红书风格的清单图文。
根据用户主题，生成一个实用清单。

返回JSON格式：
{
  "title": "清单标题（8-12字）",
  "subtitle": "副标题",
  "body": ["清单项1", "清单项2", "清单项3", "清单项4", "清单项5", "清单项6"],
  "tags": ["标签1", "标签2", "标签3"],
  "backgroundPrompt": "适合的背景图描述（英文）"
}`,

      story: `你是一个文案专家，擅长创作小红书风格的故事图文。
根据用户主题，写一个简短有感染力的故事或感悟。

返回JSON格式：
{
  "title": "故事标题（8-15字）",
  "body": "故事正文（100-150字，分段）",
  "tags": ["标签1", "标签2", "标签3"],
  "backgroundPrompt": "适合这个故事氛围的背景图描述（英文）"
}`,

      knowledge: `你是一个文案专家，擅长创作小红书风格的知识科普图文。
根据用户主题，生成一个知识点科普。

返回JSON格式：
{
  "title": "知识点标题（8-15字）",
  "subtitle": "一句话概括",
  "body": ["要点1：解释", "要点2：解释", "要点3：解释"],
  "tags": ["标签1", "标签2", "标签3"],
  "backgroundPrompt": "适合的背景图描述（英文）"
}`,
    };

    return prompts[template] || prompts.quote;
  }

  /**
   * 降级内容
   */
  private getFallbackContent(topic: string, template: string): GeneratedContent {
    return {
      title: topic,
      body: '内容生成中...',
      tags: [topic],
    };
  }

  /**
   * 获取模板列表
   */
  getTemplates(): Array<{ id: string; name: string; description: string; icon: string }> {
    return [
      { id: 'quote', name: '金句语录', description: '一句有深度的金句', icon: '💬' },
      { id: 'tips', name: '技巧干货', description: '实用技巧清单', icon: '💡' },
      { id: 'list', name: '清单合集', description: '整理类清单图文', icon: '📝' },
      { id: 'story', name: '故事感悟', description: '简短故事或感悟', icon: '📖' },
      { id: 'knowledge', name: '知识科普', description: '知识点讲解', icon: '🎓' },
      { id: 'poster', name: '海报设计', description: '活动宣传海报', icon: '🎨' },
      { id: 'card', name: '社交卡片', description: '精美社交名片', icon: '💳' },
    ];
  }

  /**
   * 获取风格列表
   */
  getStyles(): Array<{ id: string; name: string; description: string }> {
    return [
      { id: 'xiaohongshu', name: '小红书', description: '时尚潮流，清新美观' },
      { id: 'minimal', name: '极简', description: '干净简约，大量留白' },
      { id: 'gradient', name: '渐变', description: '多彩渐变背景' },
      { id: 'magazine', name: '杂志', description: '专业排版，编辑风格' },
      { id: 'retro', name: '复古', description: '怀旧色调，经典风格' },
      { id: 'cute', name: '可爱', description: '粉嫩配色，圆润元素' },
    ];
  }

  /**
   * 获取可用的 AI 模型
   */
  getModels(): Array<{ id: string; name: string; description: string; textQuality: number }> {
    return [
      { id: 'ideogram', name: 'Ideogram', description: '文字渲染最强，小红书风格首选', textQuality: 5 },
      { id: 'flux', name: 'Flux', description: '艺术感强，画面精美', textQuality: 4 },
      { id: 'jimeng', name: '即梦', description: '国内友好，中文支持好', textQuality: 4 },
    ];
  }
}
