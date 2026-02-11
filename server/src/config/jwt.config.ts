/**
 * JWT 配置
 */
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './env.validation';

export function getJwtConfig(configService: ConfigService<EnvConfig, true>) {
  return {
    client: {
      secret: configService.get('JWT_CLIENT_SECRET', { infer: true }),
      expiresIn: configService.get('JWT_CLIENT_EXPIRES_IN', { infer: true }),
      refreshExpiresIn: configService.get('JWT_CLIENT_REFRESH_EXPIRES_IN', { infer: true }),
    },
    admin: {
      secret: configService.get('JWT_ADMIN_SECRET', { infer: true }),
      expiresIn: configService.get('JWT_ADMIN_EXPIRES_IN', { infer: true }),
      refreshExpiresIn: configService.get('JWT_ADMIN_REFRESH_EXPIRES_IN', { infer: true }),
    },
  };
}
