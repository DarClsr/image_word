/**
 * 环境变量验证 - 使用 Zod
 */
import { z } from 'zod';

/**
 * 环境变量 Schema
 */
export const EnvSchema = z.object({
  // 应用配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  API_PREFIX: z.string().default('/api'),

  // 数据库
  DATABASE_URL: z.string().url('DATABASE_URL 必须是有效的 URL'),

  // Redis
  REDIS_URL: z.string().url('REDIS_URL 必须是有效的 URL'),

  // JWT 小程序端
  JWT_CLIENT_SECRET: z.string().min(32, 'JWT_CLIENT_SECRET 至少32位'),
  JWT_CLIENT_EXPIRES_IN: z.string().default('7d'),
  JWT_CLIENT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // JWT 管理端
  JWT_ADMIN_SECRET: z.string().min(32, 'JWT_ADMIN_SECRET 至少32位'),
  JWT_ADMIN_EXPIRES_IN: z.string().default('2h'),
  JWT_ADMIN_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // 微信小程序
  WECHAT_APPID: z.string().optional(),
  WECHAT_SECRET: z.string().optional(),

  // 对象存储
  STORAGE_TYPE: z.enum(['minio', 'cos']).default('minio'),
  MINIO_ENDPOINT: z.string().optional(),
  MINIO_PORT: z.string().transform(Number).optional(),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MINIO_BUCKET: z.string().optional(),
  MINIO_USE_SSL: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),

  // AI 服务
  AI_SERVICE_URL: z.string().url().optional(),
  AI_SERVICE_KEY: z.string().optional(),

  // 安全配置
  ADMIN_LOGIN_MAX_FAIL: z.string().transform(Number).default('5'),
  ADMIN_LOGIN_LOCK_TIME: z.string().transform(Number).default('1800'),

  // CORS
  CORS_ORIGINS: z.string().optional(),

  // 日志
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * 验证环境变量
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(`环境变量验证失败:\n${errors}`);
  }

  return result.data;
}
