/**
 * 当前用户装饰器
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 获取当前登录的小程序用户
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

/**
 * 获取当前登录的管理员
 */
export const CurrentAdmin = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.admin;
});
