/**
 * 认证相关 Zod Schema
 */
import { z } from 'zod';

// ==================== 小程序端 ====================

/**
 * 微信登录
 */
export const WechatLoginSchema = z.object({
  code: z.string().min(1, 'code 不能为空'),
  encryptedData: z.string().optional(),
  iv: z.string().optional(),
  userInfo: z
    .object({
      nickName: z.string().optional(),
      avatarUrl: z.string().optional(),
      gender: z.number().optional(),
    })
    .optional(),
});
export type WechatLoginInput = z.infer<typeof WechatLoginSchema>;

/**
 * 刷新 Token
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken 不能为空'),
});
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

/**
 * 小程序端 Token Payload
 */
export const ClientTokenPayloadSchema = z.object({
  sub: z.number(), // 用户ID
  type: z.literal('client'), // Token 类型标识
  tokenType: z.enum(['access', 'refresh']),
  openid: z.string(), // 微信 openid（用于二次校验）
  memberType: z.string().optional(), // 会员类型
  iat: z.number(),
  exp: z.number(),
});
export type ClientTokenPayload = z.infer<typeof ClientTokenPayloadSchema>;

/**
 * 登录响应
 */
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.number(),
    nickname: z.string(),
    avatar: z.string(),
    memberType: z.string(),
    remainQuota: z.number(),
  }),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ==================== 管理端 ====================

/**
 * 管理员登录
 */
export const AdminLoginSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50),
  password: z.string().min(6, '密码至少6位').max(32),
});
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

/**
 * 管理端 Token Payload
 */
export const AdminTokenPayloadSchema = z.object({
  sub: z.number(), // 管理员ID
  type: z.literal('admin'), // Token 类型标识
  tokenType: z.enum(['access', 'refresh']),
  username: z.string(),
  role: z.string(), // 角色：super_admin / admin / operator
  permissions: z.array(z.string()), // 权限列表
  iat: z.number(),
  exp: z.number(),
});
export type AdminTokenPayload = z.infer<typeof AdminTokenPayloadSchema>;

/**
 * 管理员登录响应
 */
export const AdminLoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  admin: z.object({
    id: z.number(),
    username: z.string(),
    realName: z.string().nullable(),
    role: z.string(),
    permissions: z.array(z.string()),
  }),
});
export type AdminLoginResponse = z.infer<typeof AdminLoginResponseSchema>;
