/**
 * 分类相关 Zod Schema
 */
import { z } from 'zod';

/**
 * 创建分类
 */
export const CreateCategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称最多50字'),
  code: z
    .string()
    .min(1, '编码不能为空')
    .max(50)
    .regex(/^[a-z0-9_]+$/, '编码只能包含小写字母、数字和下划线'),
  type: z.enum(['style', 'model'], { errorMap: () => ({ message: '类型必须是 style 或 model' }) }),
  icon: z.string().max(200).optional(),
  cover: z.string().url().max(500).optional(),
  description: z.string().max(200).optional(),
  config: z.record(z.unknown()).optional(),
  parentId: z.number().int().positive().optional(),
  sort: z.number().int().min(0).default(0),
  status: z.union([z.literal(0), z.literal(1)]).default(1),
});
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

/**
 * 更新分类
 */
export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().max(200).optional(),
  cover: z.string().url().max(500).optional(),
  description: z.string().max(200).optional(),
  config: z.record(z.unknown()).optional(),
  parentId: z.number().int().positive().nullable().optional(),
  sort: z.number().int().min(0).optional(),
  status: z.union([z.literal(0), z.literal(1)]).optional(),
});
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

/**
 * 查询分类
 */
export const QueryCategorySchema = z.object({
  type: z.enum(['style', 'model']).optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
  parentId: z.coerce.number().int().positive().optional(),
  keyword: z.string().max(50).optional(),
});
export type QueryCategoryInput = z.infer<typeof QueryCategorySchema>;

/**
 * 批量排序
 */
export const SortCategorySchema = z.object({
  items: z.array(
    z.object({
      id: z.number().int().positive(),
      sort: z.number().int().min(0),
    }),
  ),
});
export type SortCategoryInput = z.infer<typeof SortCategorySchema>;
