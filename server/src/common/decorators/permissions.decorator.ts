/**
 * 权限装饰器
 */
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * 标记接口需要的权限
 * @example @Permissions('works:list', 'works:audit')
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
