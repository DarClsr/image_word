/**
 * 用户相关 Zod Schema
 */
import { z } from 'zod';

/**
 * 更新用户信息
 */
export const UpdateUserSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  avatar: z.string().url().max(500).optional(),
  gender: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * 查询用户列表（管理端）
 */
export const QueryUserSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  keyword: z.string().max(50).optional(),
  memberType: z.string().optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
export type QueryUserInput = z.infer<typeof QueryUserSchema>;

/**
 * 调整用户额度
 */
export const UpdateQuotaSchema = z.object({
  quota: z.number().int().min(0, '额度不能为负数'),
  reason: z.string().min(1, '请填写调整原因').max(200),
});
export type UpdateQuotaInput = z.infer<typeof UpdateQuotaSchema>;

/**
 * 封禁/解封用户
 */
export const BanUserSchema = z.object({
  reason: z.string().max(200).optional(),
});
export type BanUserInput = z.infer<typeof BanUserSchema>;
