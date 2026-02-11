/**
 * 应用配置服务
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './env.validation';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {}

  get nodeEnv() {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get apiPrefix() {
    return this.configService.get('API_PREFIX', { infer: true });
  }

  get databaseUrl() {
    return this.configService.get('DATABASE_URL', { infer: true });
  }

  get redisUrl() {
    return this.configService.get('REDIS_URL', { infer: true });
  }

  get jwtClientSecret() {
    return this.configService.get('JWT_CLIENT_SECRET', { infer: true });
  }

  get jwtAdminSecret() {
    return this.configService.get('JWT_ADMIN_SECRET', { infer: true });
  }

  get corsOrigins(): string[] {
    const raw = this.configService.get('CORS_ORIGINS', { infer: true });
    if (!raw) return [];
    return raw.split(',').map((item) => item.trim()).filter(Boolean);
  }
}
