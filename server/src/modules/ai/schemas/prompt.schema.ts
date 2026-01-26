/**
 * 提示词相关 Zod Schema
 */
import { z } from 'zod';

/**
 * 扩展提示词请求
 */
export const ExpandPromptSchema = z.object({
  /** 用户原始输入 */
  text: z.string().min(2, '请输入至少2个字符').max(500, '描述最多500字'),
  /** 风格（可选） */
  style: z.string().optional(),
  /** 语言 */
  language: z.enum(['zh', 'en']).default('zh'),
});

export type ExpandPromptInput = z.infer<typeof ExpandPromptSchema>;

/**
 * 扩展结果
 */
export const ExpandPromptResultSchema = z.object({
  /** 扩展后的中文提示词 */
  promptZh: z.string(),
  /** 扩展后的英文提示词 */
  promptEn: z.string(),
  /** 负面提示词 */
  negativePrompt: z.string(),
  /** 风格标签 */
  tags: z.array(z.string()),
});

export type ExpandPromptResult = z.infer<typeof ExpandPromptResultSchema>;

/**
 * 优化提示词请求
 */
export const OptimizePromptSchema = z.object({
  /** 原始提示词 */
  prompt: z.string().min(1).max(2000),
  /** 风格 */
  style: z.string().optional(),
});

export type OptimizePromptInput = z.infer<typeof OptimizePromptSchema>;
