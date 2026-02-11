/**
 * 哈希工具函数
 */
import * as crypto from 'crypto';

/**
 * 生成 SHA256 哈希
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * 生成 HMAC-SHA256
 */
export function hmacSha256(secret: string, input: string): string {
  return crypto.createHmac('sha256', secret).update(input).digest('hex');
}
