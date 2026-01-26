/**
 * 加密工具函数
 */
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const SALT_ROUNDS = 12;

/**
 * 密码哈希
 * @param password 原始密码
 * @returns hash 和 salt
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomBytes(16).toString('hex');
  const saltedPassword = password + salt;
  const hash = await bcrypt.hash(saltedPassword, SALT_ROUNDS);
  return { hash, salt };
}

/**
 * 密码验证
 * @param password 原始密码
 * @param hash 哈希值
 * @param salt 盐值
 * @returns 是否匹配
 */
export async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  const saltedPassword = password + salt;
  return bcrypt.compare(saltedPassword, hash);
}

/**
 * 生成随机字符串
 * @param length 长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * 生成 UUID
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
