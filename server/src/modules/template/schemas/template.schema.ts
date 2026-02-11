/**
 * 模板相关 Zod Schema
 */
import { z } from 'zod';

/**
 * 查询模板列表（小程序端）
 */
export const QueryTemplateSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  keyword: z.string().max(100).optional(),
  styleId: z.coerce.number().int().positive().optional(),
  modelId: z.coerce.number().int().positive().optional(),
});
export type QueryTemplateInput = z.infer<typeof QueryTemplateSchema>;
