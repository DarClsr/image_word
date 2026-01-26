/**
 * 权限守卫（仅用于管理端）
 */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ErrorCodes } from '../filters/http-exception.filter';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取接口需要的权限
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 没有定义权限要求，直接通过
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const admin = request.admin;

    if (!admin) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: '无操作权限',
      });
    }

    // 超级管理员拥有所有权限
    if (admin.role === 'super_admin') {
      return true;
    }

    // 检查是否拥有通配符权限
    if (admin.permissions.includes('*')) {
      return true;
    }

    // 检查是否拥有所需权限
    const hasPermission = requiredPermissions.every((permission) =>
      admin.permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: '没有操作权限',
      });
    }

    return true;
  }
}
