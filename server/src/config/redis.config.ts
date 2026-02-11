/**
 * Redis 配置
 */
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './env.validation';

export function getRedisConfig(configService: ConfigService<EnvConfig, true>) {
  return {
    url: configService.get('REDIS_URL', { infer: true }),
  };
}
