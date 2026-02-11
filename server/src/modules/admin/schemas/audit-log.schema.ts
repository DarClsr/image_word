/**
 * 审计日志相关 Schema
 */
import { z } from 'zod';

export const QueryAuditLogSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  module: z.string().trim().min(1).optional(),
  action: z.string().trim().min(1).optional(),
  adminId: z.coerce.number().int().optional(),
  targetId: z.coerce.number().int().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  keyword: z.string().trim().optional(),
});

export type QueryAuditLogInput = z.infer<typeof QueryAuditLogSchema>;
