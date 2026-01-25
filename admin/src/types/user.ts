import { z } from 'zod';

export const GenderEnum = z.union([z.literal(0), z.literal(1), z.literal(2)]);
export const MemberTypeEnum = z.enum(['free', 'basic', 'pro']);
export const UserStatusEnum = z.union([z.literal(0), z.literal(1)]);

export const UserSchema = z.object({
  id: z.number(),
  openid: z.string(),
  unionid: z.string().optional(),
  nickname: z.string().min(1).max(50),
  avatar: z.string().url(),
  phone: z.string().regex(/^1[3-9]\d{9}$/).optional(),
  gender: GenderEnum,
  memberType: MemberTypeEnum,
  memberExpireAt: z.string().datetime().optional(),
  totalQuota: z.number().int().min(0),
  usedQuota: z.number().int().min(0),
  remainQuota: z.number().int().min(0),
  worksCount: z.number().int().min(0),
  totalGenerate: z.number().int().min(0),
  status: UserStatusEnum,
  lastLoginAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const UserStatusUpdateSchema = z.object({
  id: z.number(),
  status: UserStatusEnum,
  reason: z.string().max(200).optional(),
});

export type UserStatusUpdate = z.infer<typeof UserStatusUpdateSchema>;

export const UserQuotaUpdateSchema = z.object({
  id: z.number(),
  quota: z.number().int(),
  reason: z.string().min(1).max(200),
});

export type UserQuotaUpdate = z.infer<typeof UserQuotaUpdateSchema>;

export const UserMemberUpdateSchema = z.object({
  id: z.number(),
  memberType: MemberTypeEnum,
  expireAt: z.string().datetime().optional(),
  reason: z.string().max(200).optional(),
});

export type UserMemberUpdate = z.infer<typeof UserMemberUpdateSchema>;
