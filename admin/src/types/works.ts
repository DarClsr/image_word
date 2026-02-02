import { z } from 'zod';

/**
 * 生成参数 Schema
 */
export const WorkParamsSchema = z.object({
  seed: z.number().int().optional(),
  steps: z.number().int().min(1).max(150).optional(),
  guidance: z.number().min(0).max(30).optional(),
});
export type WorkParams = z.infer<typeof WorkParamsSchema>;

/**
 * 审核状态枚举
 */
export const WorkStatusEnum = z.enum(['pending', 'approved', 'rejected']);
export type WorkStatus = z.infer<typeof WorkStatusEnum>;

/**
 * 关联用户 Schema
 */
export const WorkUserSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  avatar: z.string().optional(),
});

/**
 * 关联分类 Schema
 */
export const WorkCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

/**
 * 作品 Schema
 */
export const WorkSchema = z.object({
  id: z.number(),
  userId: z.number(),
  prompt: z.string().min(1).max(2000),
  negativePrompt: z.string().max(1000).optional(),
  styleId: z.number(),
  modelId: z.number(),
  imageUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  params: WorkParamsSchema.optional(),
  status: WorkStatusEnum,
  auditReason: z.string().optional(),
  isPublic: z.boolean(),
  viewCount: z.number().int().min(0),
  downloadCount: z.number().int().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // 关联对象（后端返回）
  user: WorkUserSchema.optional(),
  style: WorkCategorySchema.optional(),
  model: WorkCategorySchema.optional(),
  // 兼容字段（前端展示用）
  userName: z.string().optional(),
  styleName: z.string().optional(),
  modelName: z.string().optional(),
});

export type Work = z.infer<typeof WorkSchema>;
export type WorkUser = z.infer<typeof WorkUserSchema>;
export type WorkCategory = z.infer<typeof WorkCategorySchema>;

/**
 * 作品审核 Schema
 */
export const WorkAuditSchema = z.object({
  id: z.number(),
  status: WorkStatusEnum,
  reason: z.string().max(500).optional(),
});
export type WorkAudit = z.infer<typeof WorkAuditSchema>;

/**
 * 批量审核 Schema
 */
export const WorkBatchAuditSchema = z.object({
  ids: z.array(z.number()).min(1),
  status: WorkStatusEnum,
  reason: z.string().max(500).optional(),
});
export type WorkBatchAudit = z.infer<typeof WorkBatchAuditSchema>;

/**
 * 作品查询参数
 */
export const WorkQuerySchema = z.object({
  keyword: z.string().optional(),
  styleId: z.number().optional(),
  modelId: z.number().optional(),
  status: WorkStatusEnum.optional(),
  userId: z.number().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
export type WorkQuery = z.infer<typeof WorkQuerySchema>;