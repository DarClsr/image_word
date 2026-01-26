/**
 * 认证模块
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// 服务
import { ClientAuthService } from './services/client-auth.service';
import { AdminAuthService } from './services/admin-auth.service';

// 控制器
import { ClientAuthController } from './controllers/client-auth.controller';
import { AdminAuthController } from './controllers/admin-auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // 这里设置默认配置，具体签名时会覆盖
        secret: configService.get<string>('JWT_CLIENT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_CLIENT_EXPIRES_IN') || '7d',
        },
      }),
    }),
  ],
  controllers: [ClientAuthController, AdminAuthController],
  providers: [ClientAuthService, AdminAuthService],
  exports: [ClientAuthService, AdminAuthService, JwtModule],
})
export class AuthModule {}
