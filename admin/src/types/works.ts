import { z } from 'zod';

export const WorkParamsSchema = z.object({
  seed: z.number().int(),
  steps: z.number().int().min(1).max(150),
  guidance: z.number().min(0).max(30),
});

export const WorkStatusEnum = z.enum(['pending', 'approved', 'rejected']);

export const WorkSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userName: z.string(),
  prompt: z.string().min(1).max(2000),
  negativePrompt: z.string().max(1000).optional(),
  styleId: z.number(),
  styleName: z.string(),
  modelId: z.number(),
  modelName: z.string(),
  imageUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  params: WorkParamsSchema,
  status: WorkStatusEnum,
  isPublic: z.boolean(),
  viewCount: z.number().int().min(0),
  downloadCount: z.number().int().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Work = z.infer<typeof WorkSchema>;
export type WorkParams = z.infer<typeof WorkParamsSchema>;
export type WorkStatus = z.infer<typeof WorkStatusEnum>;

export const WorkAuditSchema = z.object({
  id: z.number(),
  status: WorkStatusEnum,
  reason: z.string().max(500).optional(),
});

export type WorkAudit = z.infer<typeof WorkAuditSchema>;

export const WorkBatchAuditSchema = z.object({
  ids: z.array(z.number()).min(1),
  status: WorkStatusEnum,
  reason: z.string().max(500).optional(),
});

export type WorkBatchAudit = z.infer<typeof WorkBatchAuditSchema>;
