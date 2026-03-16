/**
 * 鐢ㄦ埛鐩稿叧 Zod Schema
 */
import { z } from 'zod';

/**
 * 鏇存柊鐢ㄦ埛淇℃伅
 */
export const UpdateUserSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  avatar: z.string().url().max(500).optional(),
  gender: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * 鏌ヨ鐢ㄦ埛鍒楄〃锛堢鐞嗙锛?
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
 * 璋冩暣鐢ㄦ埛棰濆害
 */
export const UpdateQuotaSchema = z.object({
  amount: z.number().int(),
  reason: z.string().min(1, '调整原因必填').max(200),
});
export type UpdateQuotaInput = z.infer<typeof UpdateQuotaSchema>;

/**
 * 调整会员
 */
export const UpdateMemberSchema = z.object({
  memberType: z.enum(['free', 'basic', 'pro']),
  expireAt: z.string().datetime().optional(),
  reason: z.string().max(200).optional(),
});
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;

/**
 * 灏佺/瑙ｅ皝鐢ㄦ埛
 */
export const BanUserSchema = z.object({
  reason: z.string().max(200).optional(),
});
export type BanUserInput = z.infer<typeof BanUserSchema>;


