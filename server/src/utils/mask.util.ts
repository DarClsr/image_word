/**
 * 数据脱敏工具函数
 */

/**
 * 手机号脱敏
 * @param phone 手机号
 * @returns 脱敏后的手机号
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || phone.length !== 11) return phone || '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * OpenID 脱敏（日志使用）
 * @param openId OpenID
 * @returns 脱敏后的 OpenID
 */
export function maskOpenId(openId: string | null | undefined): string {
  if (!openId || openId.length < 10) return '***';
  return openId.slice(0, 6) + '****' + openId.slice(-4);
}

/**
 * 邮箱脱敏
 * @param email 邮箱
 * @returns 脱敏后的邮箱
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return email || '';
  const [name, domain] = email.split('@');
  const maskedName = name.length > 2 ? name[0] + '***' + name.slice(-1) : '***';
  return `${maskedName}@${domain}`;
}

/**
 * 响应数据自动脱敏
 * @param data 数据
 * @param sensitiveFields 额外的敏感字段
 * @returns 脱敏后的数据
 */
export function sanitizeResponse<T>(data: T, sensitiveFields: string[] = []): T {
  const defaultSensitive = ['openid', 'unionid', 'password', 'salt', 'sessionKey'];
  const allSensitive = [...defaultSensitive, ...sensitiveFields];

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResponse(item, sensitiveFields)) as T;
  }

  if (data && typeof data === 'object') {
    const result = { ...data } as Record<string, unknown>;
    for (const key of allSensitive) {
      if (key in result) {
        delete result[key];
      }
    }
    // 手机号脱敏显示
    if ('phone' in result && result.phone) {
      result.phone = maskPhone(result.phone as string);
    }
    return result as T;
  }

  return data;
}
