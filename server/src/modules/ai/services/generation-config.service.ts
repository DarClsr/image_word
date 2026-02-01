/**
 * 生成配置服务 - 提供前端所需的配置选项
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';

/**
 * 风格配置
 */
interface StyleConfig {
  id: number;
  name: string;
  code: string;
  icon: string;
  gradient: string;
  prompt: string; // 风格对应的提示词后缀
  sort: number;
}

/**
 * 模型配置
 */
interface ModelConfig {
  id: number;
  name: string;
  code: string;
  icon?: string;
  description: string;
  price: number; // 积分消耗
  priceLabel: string; // 显示的价格标签：¥/¥¥/¥¥¥
  speed: 'fast' | 'medium' | 'slow';
  speedLabel: string;
  quality: number; // 1-5
  qualityLabel: string;
  badge?: string;
  sort: number;
}

/**
 * 比例配置
 */
interface RatioConfig {
  id: number;
  label: string;
  value: string;
  width: number;
  height: number;
  sort: number;
}

/**
 * 数量配置
 */
interface CountConfig {
  id: number;
  label: string;
  value: number;
  multiplier: number; // 积分倍数
  sort: number;
}

/**
 * 完整的生成配置
 */
export interface GenerationConfig {
  styles: StyleConfig[];
  models: ModelConfig[];
  ratios: RatioConfig[];
  counts: CountConfig[];
  defaults: {
    styleId: number;
    modelId: number;
    ratioIndex: number;
    countIndex: number;
  };
}

@Injectable()
export class GenerationConfigService {
  private readonly CACHE_KEY = 'generation:config';
  private readonly CACHE_TTL = 300; // 5分钟缓存

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * 获取完整的生成配置（供小程序端使用）
   */
  async getConfig(): Promise<GenerationConfig> {
    // 尝试从缓存获取
    const cached = await this.redis.get(this.CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    // 从数据库获取配置
    const config = await this.buildConfig();

    // 写入缓存
    await this.redis.set(this.CACHE_KEY, JSON.stringify(config), this.CACHE_TTL);

    return config;
  }

  /**
   * 构建配置
   */
  private async buildConfig(): Promise<GenerationConfig> {
    // 从数据库获取风格（Category 表 type='style'）
    const stylesFromDb = await this.prisma.category.findMany({
      where: { type: 'style', status: 1 },
      orderBy: { sort: 'asc' },
    });

    // 从数据库获取模型（Category 表 type='model'）
    const modelsFromDb = await this.prisma.category.findMany({
      where: { type: 'model', status: 1 },
      orderBy: { sort: 'asc' },
    });

    // 从 SystemConfig 获取比例、数量、默认值配置
    const systemConfigs = await this.prisma.systemConfig.findMany({
      where: {
        key: { in: ['generation_ratios', 'generation_counts', 'generation_defaults'] },
      },
    });

    const configMap = new Map(systemConfigs.map(c => [c.key, c.value]));

    // 解析配置
    const ratios = this.parseRatios(configMap.get('generation_ratios'));
    const counts = this.parseCounts(configMap.get('generation_counts'));
    const defaults = this.parseDefaults(configMap.get('generation_defaults'));

    // 转换风格（从 config JSON 字段读取扩展属性）
    const styles: StyleConfig[] = stylesFromDb.map((s) => {
      const cfg = (s.config as Record<string, unknown>) || {};
      return {
        id: s.id,
        name: s.name,
        code: s.code,
        icon: (cfg.icon as string) || this.getStyleIcon(s.code),
        gradient: (cfg.gradient as string) || this.getStyleGradient(s.code),
        prompt: (cfg.promptSuffix as string) || '',
        sort: s.sort,
      };
    });

    // 转换模型（从 config JSON 字段读取扩展属性）
    const models: ModelConfig[] = modelsFromDb.map(m => {
      const cfg = (m.config as Record<string, unknown>) || {};
      const price = (cfg.price as number) || 1;
      const speed = (cfg.speed as number) || 3;
      const quality = (cfg.quality as number) || 3;
      
      return {
        id: m.id,
        name: m.name,
        code: m.code,
        icon: m.icon || (cfg.icon as string) || undefined,
        description: m.description || '',
        price,
        priceLabel: this.getPriceLabel(price),
        speed: this.getSpeedLevel(speed),
        speedLabel: this.getSpeedLabel(speed),
        quality,
        qualityLabel: this.getQualityLabel(quality),
        badge: (cfg.badge as string) || undefined,
        sort: m.sort,
      };
    });

    return {
      styles: styles.length > 0 ? styles : this.getDefaultStyles(),
      models: models.length > 0 ? models : this.getDefaultModels(),
      ratios,
      counts,
      defaults,
    };
  }

  /**
   * 解析比例配置
   */
  private parseRatios(value?: string): RatioConfig[] {
    if (value) {
      try {
        return JSON.parse(value);
      } catch {}
    }
    
    // 默认比例
    return [
      { id: 1, label: '1:1 方形', value: '1:1', width: 1024, height: 1024, sort: 1 },
      { id: 2, label: '3:4 竖版', value: '3:4', width: 768, height: 1024, sort: 2 },
      { id: 3, label: '4:3 横版', value: '4:3', width: 1024, height: 768, sort: 3 },
      { id: 4, label: '9:16 手机屏', value: '9:16', width: 576, height: 1024, sort: 4 },
      { id: 5, label: '16:9 宽屏', value: '16:9', width: 1024, height: 576, sort: 5 },
    ];
  }

  /**
   * 解析数量配置
   */
  private parseCounts(value?: string): CountConfig[] {
    if (value) {
      try {
        return JSON.parse(value);
      } catch {}
    }
    
    // 默认数量
    return [
      { id: 1, label: '1 张', value: 1, multiplier: 1, sort: 1 },
      { id: 2, label: '2 张', value: 2, multiplier: 2, sort: 2 },
      { id: 3, label: '4 张', value: 4, multiplier: 4, sort: 3 },
      { id: 4, label: '6 张', value: 6, multiplier: 6, sort: 4 },
      { id: 5, label: '8 张', value: 8, multiplier: 8, sort: 5 },
    ];
  }

  /**
   * 解析默认值配置
   */
  private parseDefaults(value?: string): GenerationConfig['defaults'] {
    if (value) {
      try {
        return JSON.parse(value);
      } catch {}
    }
    
    return {
      styleId: 1,
      modelId: 1,
      ratioIndex: 0,
      countIndex: 2, // 默认4张
    };
  }

  /**
   * 获取风格图标
   */
  private getStyleIcon(code: string): string {
    const icons: Record<string, string> = {
      'chinese': '🏯',
      'realistic': '📷',
      'anime': '🎨',
      'illustration': '✏️',
      'cyberpunk': '🌃',
      'watercolor': '🎨',
      'oil': '🖼️',
      'sketch': '✏️',
      'minimal': '⬜',
      '3d': '🧊',
    };
    return icons[code] || '🎨';
  }

  /**
   * 获取风格渐变色
   */
  private getStyleGradient(code: string): string {
    const gradients: Record<string, string> = {
      'chinese': 'linear-gradient(135deg, #DC2626, #F87171)',
      'realistic': 'linear-gradient(135deg, #059669, #34D399)',
      'anime': 'linear-gradient(135deg, #7C3AED, #A78BFA)',
      'illustration': 'linear-gradient(135deg, #DB2777, #F472B6)',
      'cyberpunk': 'linear-gradient(135deg, #0891B2, #22D3EE)',
      'watercolor': 'linear-gradient(135deg, #60A5FA, #93C5FD)',
      'oil': 'linear-gradient(135deg, #D97706, #FCD34D)',
      'sketch': 'linear-gradient(135deg, #6B7280, #9CA3AF)',
      'minimal': 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
      '3d': 'linear-gradient(135deg, #8B5CF6, #C4B5FD)',
    };
    return gradients[code] || 'linear-gradient(135deg, #60A5FA, #93C5FD)';
  }

  /**
   * 获取价格标签
   */
  private getPriceLabel(price: number): string {
    if (price <= 1) return '¥';
    if (price <= 3) return '¥¥';
    return '¥¥¥';
  }

  /**
   * 获取速度等级
   */
  private getSpeedLevel(speed?: number): 'fast' | 'medium' | 'slow' {
    if (!speed) return 'medium';
    if (speed >= 4) return 'fast';
    if (speed >= 2) return 'medium';
    return 'slow';
  }

  /**
   * 获取速度标签
   */
  private getSpeedLabel(speed?: number): string {
    const level = this.getSpeedLevel(speed);
    const labels = { fast: '快', medium: '中', slow: '慢' };
    return labels[level];
  }

  /**
   * 获取质量标签
   */
  private getQualityLabel(quality: number): string {
    const labels = ['一般', '较好', '高', '很高', '极高'];
    return labels[Math.min(quality - 1, 4)] || '高';
  }

  /**
   * 默认风格列表
   */
  private getDefaultStyles(): StyleConfig[] {
    return [
      { id: 1, name: '国风', code: 'chinese', icon: '🏯', gradient: 'linear-gradient(135deg, #DC2626, #F87171)', prompt: 'Chinese traditional style, ink painting', sort: 1 },
      { id: 2, name: '写实', code: 'realistic', icon: '📷', gradient: 'linear-gradient(135deg, #059669, #34D399)', prompt: 'photorealistic, 8k, detailed', sort: 2 },
      { id: 3, name: '动漫', code: 'anime', icon: '🎨', gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)', prompt: 'anime style, vibrant colors', sort: 3 },
      { id: 4, name: '插画', code: 'illustration', icon: '✏️', gradient: 'linear-gradient(135deg, #DB2777, #F472B6)', prompt: 'illustration, flat design', sort: 4 },
      { id: 5, name: '赛博', code: 'cyberpunk', icon: '🌃', gradient: 'linear-gradient(135deg, #0891B2, #22D3EE)', prompt: 'cyberpunk, neon lights, futuristic', sort: 5 },
    ];
  }

  /**
   * 默认模型列表
   */
  private getDefaultModels(): ModelConfig[] {
    return [
      { id: 1, name: 'SDXL', code: 'sdxl', description: '稳定高效，性价比之选', price: 1, priceLabel: '¥', speed: 'fast', speedLabel: '快', quality: 4, qualityLabel: '高', badge: '推荐', sort: 1 },
      { id: 2, name: 'Flux', code: 'flux', description: '风格细腻，艺术感强', price: 2, priceLabel: '¥¥', speed: 'medium', speedLabel: '中', quality: 5, qualityLabel: '极高', sort: 2 },
      { id: 3, name: 'DALL·E', code: 'dalle', description: '理解力强，通用表现', price: 3, priceLabel: '¥¥¥', speed: 'medium', speedLabel: '中', quality: 4, qualityLabel: '高', sort: 3 },
    ];
  }

  /**
   * 清除配置缓存
   */
  async clearCache(): Promise<void> {
    await this.redis.del(this.CACHE_KEY);
  }
}
