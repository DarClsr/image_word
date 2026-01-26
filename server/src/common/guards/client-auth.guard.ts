/**
 * 小程序端认证守卫
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
import { ClientTokenPayload } from '../../modules/auth/schemas/auth.schema';
import { ErrorCodes } from '../filters/http-exception.filter';

@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
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
      const payload = await this.jwtService.verifyAsync<ClientTokenPayload>(token, {
        secret: this.configService.get<string>('JWT_CLIENT_SECRET'),
      });

      // 验证 Token 类型
      if (payload.type !== 'client') {
        throw new UnauthorizedException({
          code: ErrorCodes.TOKEN_INVALID,
          message: '无效的 Token 类型',
        });
      }

      // 验证用户状态
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException({
          code: ErrorCodes.TOKEN_INVALID,
          message: '用户不存在',
        });
      }

      if (user.status === 0) {
        throw new UnauthorizedException({
          code: ErrorCodes.USER_BANNED,
          message: '账号已被封禁',
        });
      }

      // 二次校验 openid
      if (user.openid !== payload.openid) {
        throw new UnauthorizedException({
          code: ErrorCodes.TOKEN_INVALID,
          message: 'Token 已失效',
        });
      }

      // 挂载用户信息到请求对象
      request.user = user;
      request.tokenPayload = payload;

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
