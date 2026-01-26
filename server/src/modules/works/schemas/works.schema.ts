/**
 * 作品相关 Zod Schema
 */
import { z } from 'zod';

/**
 * 创建作品（生成任务）
 */
export const CreateWorksSchema = z.object({
  prompt: z.string().min(1, '提示词不能为空').max(2000, '提示词最多2000字'),
  negativePrompt: z.string().max(1000).optional(),
  styleId: z.number().int().positive('请选择风格'),
  modelId: z.number().int().positive('请选择模型'),
  params: z
    .object({
      width: z.number().int().min(256).max(2048).default(1024),
      height: z.number().int().min(256).max(2048).default(1024),
      steps: z.number().int().min(1).max(100).default(30),
      guidance: z.number().min(1).max(30).default(7.5),
      seed: z.number().int().optional(),
      ratio: z.string().optional(),
      count: z.number().int().min(1).max(8).default(1),
    })
    .optional(),
});
export type CreateWorksInput = z.infer<typeof CreateWorksSchema>;

/**
 * 查询作品列表
 */
export const QueryWorksSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  styleId: z.coerce.number().int().positive().optional(),
  modelId: z.coerce.number().int().positive().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  isPublic: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  userId: z.coerce.number().int().positive().optional(),
  keyword: z.string().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
export type QueryWorksInput = z.infer<typeof QueryWorksSchema>;

/**
 * 审核作品
 */
export const AuditWorksSchema = z
  .object({
    status: z.enum(['approved', 'rejected']),
    reason: z.string().max(500).optional(),
  })
  .refine((data) => data.status !== 'rejected' || data.reason, {
    message: '拒绝时必须填写原因',
    path: ['reason'],
  });
export type AuditWorksInput = z.infer<typeof AuditWorksSchema>;

/**
 * 批量审核
 */
export const BatchAuditWorksSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, '请选择作品'),
  status: z.enum(['approved', 'rejected']),
  reason: z.string().max(500).optional(),
});
export type BatchAuditWorksInput = z.infer<typeof BatchAuditWorksSchema>;
