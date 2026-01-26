/**
 * 管理端认证服务
 */
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { ErrorCodes } from '../../../common/filters/http-exception.filter';
import { verifyPassword } from '../../../utils/crypto.util';
import { AdminLoginInput, AdminLoginResponse, AdminTokenPayload } from '../schemas/auth.schema';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * 管理员登录
   */
  async login(dto: AdminLoginInput, ip: string): Promise<AdminLoginResponse> {
    const { username, password } = dto;

    // 1. 检查登录失败次数（防暴力破解）
    const maxFail = this.configService.get<number>('ADMIN_LOGIN_MAX_FAIL') || 5;
    const lockTime = this.configService.get<number>('ADMIN_LOGIN_LOCK_TIME') || 1800;
    const failKey = `admin_login_fail:${username}`;

    const failCount = await this.redis.get(failKey);
    if (failCount && parseInt(failCount, 10) >= maxFail) {
      throw new HttpException(
        {
          code: ErrorCodes.LOGIN_FAILED,
          message: `登录失败次数过多，请 ${Math.ceil(lockTime / 60)} 分钟后重试`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. 查找管理员
    const admin = await this.prisma.adminUser.findUnique({
      where: { username },
    });

    if (!admin) {
      await this.incrementLoginFail(failKey, lockTime);
      throw new UnauthorizedException({
        code: ErrorCodes.LOGIN_FAILED,
        message: '用户名或密码错误',
      });
    }

    // 3. 验证密码
    const isValid = await verifyPassword(password, admin.password, admin.salt);
    if (!isValid) {
      await this.incrementLoginFail(failKey, lockTime);
      throw new UnauthorizedException({
        code: ErrorCodes.LOGIN_FAILED,
        message: '用户名或密码错误',
      });
    }

    // 4. 检查状态
    if (admin.status === 0) {
      throw new ForbiddenException({
        code: ErrorCodes.USER_BANNED,
        message: '账号已被禁用',
      });
    }

    // 5. 清除登录失败记录
    await this.redis.del(failKey);

    // 6. 更新登录信息
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    // 7. 生成 Token
    return this.generateAdminTokens(admin);
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<AdminLoginResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<AdminTokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_ADMIN_SECRET'),
      });

      // 验证 Token 类型
      if (payload.type !== 'admin' || payload.tokenType !== 'refresh') {
        throw new UnauthorizedException({
          code: ErrorCodes.TOKEN_INVALID,
          message: '无效的刷新令牌',
        });
      }

      // 验证 Redis 中的 Token
      const storedToken = await this.redis.get(`admin_token:${payload.sub}`);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedException({
          code: ErrorCodes.TOKEN_EXPIRED,
          message: '刷新令牌已失效，请重新登录',
        });
      }

      // 获取管理员信息
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
      });

      if (!admin || admin.status === 0) {
        throw new UnauthorizedException({
          code: ErrorCodes.USER_BANNED,
          message: '账号不存在或已被禁用',
        });
      }

      // 生成新 Token
      return this.generateAdminTokens(admin);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException({
        code: ErrorCodes.TOKEN_INVALID,
        message: '刷新令牌无效或已过期',
      });
    }
  }

  /**
   * 生成管理端 Token
   */
  private async generateAdminTokens(admin: {
    id: number;
    username: string;
    realName: string | null;
    role: string;
    permissions: string[];
  }): Promise<AdminLoginResponse> {
    const adminSecret = this.configService.get<string>('JWT_ADMIN_SECRET');
    const accessExpiresIn = this.configService.get<string>('JWT_ADMIN_EXPIRES_IN') || '2h';
    const refreshExpiresIn = this.configService.get<string>('JWT_ADMIN_REFRESH_EXPIRES_IN') || '7d';

    const basePayload = {
      sub: admin.id,
      type: 'admin' as const,
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...basePayload, tokenType: 'access' as const },
        {
          secret: adminSecret,
          expiresIn: accessExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        { ...basePayload, tokenType: 'refresh' as const },
        {
          secret: adminSecret,
          expiresIn: refreshExpiresIn,
        },
      ),
    ]);

    // 存储 Token 到 Redis（单点登录：新登录会踢掉旧登录）
    await this.redis.set(`admin_token:${admin.id}`, refreshToken, 7 * 24 * 60 * 60);

    // 计算过期时间（秒）
    const expiresIn = this.parseExpiresIn(accessExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      admin: {
        id: admin.id,
        username: admin.username,
        realName: admin.realName,
        role: admin.role,
        permissions: admin.permissions,
      },
    };
  }

  /**
   * 增加登录失败次数
   */
  private async incrementLoginFail(key: string, lockTime: number): Promise<void> {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, lockTime);
    }
  }

  /**
   * 解析过期时间字符串为秒数
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 2 * 60 * 60; // 默认2小时

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 2 * 60 * 60;
    }
  }

  /**
   * 登出
   */
  async logout(adminId: number): Promise<void> {
    await this.redis.del(`admin_token:${adminId}`);
  }
}
