/**
 * 管理端认证守卫
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { AdminTokenPayload } from '../../modules/auth/schemas/auth.schema';
import { ErrorCodes } from '../filters/http-exception.filter';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否为公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: '请先登录',
      });
    }

    try {
      // 验证 Token
      const payload = await this.jwtService.verifyAsync<AdminTokenPayload>(token, {
        secret: this.configService.get<string>('JWT_ADMIN_SECRET'),
      });

      // 验证 Token 类型
      if (payload.type !== 'admin') {
        throw new UnauthorizedException({
          code: ErrorCodes.TOKEN_INVALID,
          message: '无效的 Token 类型',
        });
      }

      // 验证 Redis 中的 Token（单点登录校验）
      const storedToken = await this.redis.get(`admin_token:${payload.sub}`);
      if (!storedToken) {
        throw new UnauthorizedException({
          code: ErrorCodes.TOKEN_EXPIRED,
          message: 'Token 已失效，请重新登录',
        });
      }

      // 验证管理员状态
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
      });

      if (!admin) {
        throw new UnauthorizedException({
          code: ErrorCodes.TOKEN_INVALID,
          message: '账号不存在',
        });
      }

      if (admin.status === 0) {
        throw new UnauthorizedException({
          code: ErrorCodes.USER_BANNED,
          message: '账号已被禁用',
        });
      }

      // 挂载管理员信息到请求对象（使用最新权限）
      request.admin = {
        ...admin,
        permissions: admin.permissions,
      };
      request.tokenPayload = {
        ...payload,
        role: admin.role,
        permissions: admin.permissions,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({
        code: ErrorCodes.TOKEN_INVALID,
        message: 'Token 无效或已过期',
      });
    }
  }

  private extractToken(request: Request & { headers: Record<string, string> }): string | null {
    const authorization = request.headers['authorization'];
    if (!authorization) return null;

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
