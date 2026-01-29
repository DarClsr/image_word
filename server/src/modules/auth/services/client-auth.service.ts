/**
 * 小程序端认证服务
 */
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { LoggerService } from '../../../shared/logger/logger.service';
import { ErrorCodes } from '../../../common/filters/http-exception.filter';
import { WechatService } from './wechat.service';
import {
  WechatLoginInput,
  LoginResponse,
  ClientTokenPayload,
} from '../schemas/auth.schema';

@Injectable()
export class ClientAuthService {
  /** 是否使用模拟模式（开发环境且微信未配置时启用） */
  private readonly useMockMode: boolean;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly wechatService: WechatService,
    private readonly logger: LoggerService,
  ) {
    // 开发环境且微信未配置时启用模拟模式
    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
    this.useMockMode = isDev && !this.wechatService.isConfigured();
    
    if (this.useMockMode) {
      this.logger.warn('微信登录使用模拟模式（开发环境）', 'ClientAuthService');
    }
  }

  /**
   * 微信登录
   */
  async wechatLogin(dto: WechatLoginInput): Promise<LoginResponse> {
    let wxSession: { openid: string; unionid: string | null };

    // 根据模式选择真实调用或模拟
    if (this.useMockMode) {
      // 模拟模式：用于开发测试
      this.logger.debug(`模拟微信登录: code=${dto.code}`, 'ClientAuthService');
      wxSession = {
        openid: `mock_openid_${dto.code}`,
        unionid: null,
      };
    } else {
      // 真实调用微信 API
      const session = await this.wechatService.code2Session(dto.code);
      wxSession = {
        openid: session.openid,
        unionid: session.unionid || null,
      };
    }

    // 2. 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { openid: wxSession.openid },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          openid: wxSession.openid,
          unionid: wxSession.unionid,
          nickname: dto.userInfo?.nickName || '微信用户',
          avatar: dto.userInfo?.avatarUrl || '',
          gender: dto.userInfo?.gender || 0,
          totalQuota: 5, // 默认免费额度
        },
      });
    } else {
      // 更新最后登录时间
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // 3. 检查用户状态
    if (user.status === 0) {
      throw new ForbiddenException({
        code: ErrorCodes.USER_BANNED,
        message: '账号已被封禁',
      });
    }

    // 4. 生成 Token
    return this.generateClientTokens(user);
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<ClientTokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_CLIENT_SECRET'),
      });

      // 验证 Token 类型
      if (payload.type !== 'client' || payload.tokenType !== 'refresh') {
        throw new UnauthorizedException({
          code: ErrorCodes.TOKEN_INVALID,
          message: '无效的刷新令牌',
        });
      }

      // 验证 Redis 中的 Token
      const storedToken = await this.redis.get(`client_refresh:${payload.sub}`);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedException({
          code: ErrorCodes.TOKEN_EXPIRED,
          message: '刷新令牌已失效',
        });
      }

      // 获取用户信息
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status === 0) {
        throw new UnauthorizedException({
          code: ErrorCodes.USER_BANNED,
          message: '用户不存在或已被封禁',
        });
      }

      // 生成新 Token
      return this.generateClientTokens(user);
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
   * 生成小程序端 Token
   */
  private async generateClientTokens(user: {
    id: number;
    openid: string;
    nickname: string;
    avatar: string;
    memberType: string;
    totalQuota: number;
    usedQuota: number;
  }): Promise<LoginResponse> {
    const clientSecret = this.configService.get<string>('JWT_CLIENT_SECRET');
    const accessExpiresIn = this.configService.get<string>('JWT_CLIENT_EXPIRES_IN') || '7d';
    const refreshExpiresIn = this.configService.get<string>('JWT_CLIENT_REFRESH_EXPIRES_IN') || '30d';

    const basePayload = {
      sub: user.id,
      type: 'client' as const,
      openid: user.openid,
      memberType: user.memberType,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...basePayload, tokenType: 'access' as const },
        {
          secret: clientSecret,
          expiresIn: accessExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        { ...basePayload, tokenType: 'refresh' as const },
        {
          secret: clientSecret,
          expiresIn: refreshExpiresIn,
        },
      ),
    ]);

    // 存储 refreshToken 到 Redis（30天过期）
    await this.redis.set(`client_refresh:${user.id}`, refreshToken, 30 * 24 * 60 * 60);

    // 计算过期时间（秒）
    const expiresIn = this.parseExpiresIn(accessExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        memberType: user.memberType,
        remainQuota: user.totalQuota - user.usedQuota,
      },
    };
  }

  /**
   * 解析过期时间字符串为秒数
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60; // 默认7天

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
        return 7 * 24 * 60 * 60;
    }
  }

  /**
   * 获取用户信息
   */
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        phone: true,
        gender: true,
        memberType: true,
        memberExpireAt: true,
        totalQuota: true,
        usedQuota: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.TOKEN_INVALID,
        message: '用户不存在',
      });
    }

    return {
      ...user,
      remainQuota: user.totalQuota - user.usedQuota,
    };
  }

  /**
   * 登出
   */
  async logout(userId: number): Promise<void> {
    await this.redis.del(`client_refresh:${userId}`);
  }
}
