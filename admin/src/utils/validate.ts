import { z } from 'zod';

/**
 * 验证工具函数
 */

/**
 * 手机号正则
 */
export const PHONE_REGEX = /^1[3-9]\d{9}$/;

/**
 * 邮箱正则
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * 身份证正则
 */
export const ID_CARD_REGEX = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;

/**
 * URL 正则
 */
export const URL_REGEX = /^https?:\/\/.+/;

/**
 * 验证手机号
 */
export const isPhone = (value: string): boolean => PHONE_REGEX.test(value);

/**
 * 验证邮箱
 */
export const isEmail = (value: string): boolean => EMAIL_REGEX.test(value);

/**
 * 验证身份证
 */
export const isIdCard = (value: string): boolean => ID_CARD_REGEX.test(value);

/**
 * 验证 URL
 */
export const isUrl = (value: string): boolean => URL_REGEX.test(value);

/**
 * 验证是否为空
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Zod Schema 验证辅助函数
 * @param schema Zod Schema
 * @param data 待验证数据
 * @returns 验证结果
 */
export const validate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
};

/**
 * 获取 Zod 验证错误信息
 */
export const getZodErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.issues.forEach((err: z.ZodIssue) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  return errors;
};

/**
 * 常用 Zod Schema
 */
export const ZodSchemas = {
  /** 手机号 */
  phone: z.string().regex(PHONE_REGEX, '请输入正确的手机号'),

  /** 邮箱 */
  email: z.string().regex(EMAIL_REGEX, '请输入正确的邮箱'),

  /** 身份证 */
  idCard: z.string().regex(ID_CARD_REGEX, '请输入正确的身份证号'),

  /** 非空字符串 */
  requiredString: z.string().min(1, '此字段不能为空'),

  /** 正整数 */
  positiveInt: z.number().int().positive('请输入正整数'),

  /** 非负整数 */
  nonNegativeInt: z.number().int().min(0, '请输入非负整数'),

  /** 分页参数 */
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
  }),

  /** ID */
  id: z.number().int().positive('ID 必须是正整数'),

  /** IDs 数组 */
  ids: z.array(z.number().int().positive()).min(1, '至少选择一项'),
};
