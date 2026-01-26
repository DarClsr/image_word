import { z } from 'zod';

/**
 * 性别枚举
 */
export const GenderEnum = z.union([z.literal(0), z.literal(1), z.literal(2)]);
export type Gender = z.infer<typeof GenderEnum>;

/**
 * 会员类型枚举
 */
export const MemberTypeEnum = z.enum(['free', 'basic', 'pro']);
export type MemberType = z.infer<typeof MemberTypeEnum>;

/**
 * 用户状态枚举
 */
export const UserStatusEnum = z.union([z.literal(0), z.literal(1)]);
export type UserStatus = z.infer<typeof UserStatusEnum>;

/**
 * 用户 Schema
 */
export const UserSchema = z.object({
  id: z.number(),
  openid: z.string(),
  unionid: z.string().optional(),
  nickname: z.string().min(1).max(50),
  avatar: z.string().url(),
  phone: z.string().optional(),
  gender: GenderEnum,

  // 会员信息
  memberType: MemberTypeEnum,
  memberExpireAt: z.string().datetime().optional(),

  // 额度信息
  totalQuota: z.number().int().min(0),
  usedQuota: z.number().int().min(0),

  // 统计信息
  worksCount: z.number().int().min(0),
  totalGenerate: z.number().int().min(0),

  // 状态
  status: UserStatusEnum,

  // 时间
  lastLoginAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * 用户封禁/解封 Schema
 */
export const UserStatusUpdateSchema = z.object({
  id: z.number(),
  status: UserStatusEnum,
  reason: z.string().max(200).optional(),
});
export type UserStatusUpdate = z.infer<typeof UserStatusUpdateSchema>;

/**
 * 用户额度调整 Schema
 */
export const UserQuotaUpdateSchema = z.object({
  id: z.number(),
  quota: z.number().int(),
  reason: z.string().min(1).max(200),
});
export type UserQuotaUpdate = z.infer<typeof UserQuotaUpdateSchema>;

/**
 * 用户会员调整 Schema
 */
export const UserMemberUpdateSchema = z.object({
  id: z.number(),
  memberType: MemberTypeEnum,
  expireAt: z.string().datetime().optional(),
  reason: z.string().max(200).optional(),
});
export type UserMemberUpdate = z.infer<typeof UserMemberUpdateSchema>;
