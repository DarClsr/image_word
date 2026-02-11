/**
 * 校验工具函数
 */

/**
 * 是否为有效手机号（中国大陆 11 位）
 */
export function isValidPhone(phone: string): boolean {
  return /^1\d{10}$/.test(phone);
}

/**
 * 是否为有效邮箱
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
