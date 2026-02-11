/**
 * 数据库配置
 */
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './env.validation';

export function getDatabaseConfig(configService: ConfigService<EnvConfig, true>) {
  return {
    url: configService.get('DATABASE_URL', { infer: true }),
  };
}
