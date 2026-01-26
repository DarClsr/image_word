/**
 * 管理端认证控制器
 */
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AdminAuthService } from '../services/admin-auth.service';
import { Public, CurrentAdmin } from '../../../common/decorators';
import { AdminAuthGuard } from '../../../common/guards';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  AdminLoginSchema,
  AdminLoginInput,
  RefreshTokenSchema,
  RefreshTokenInput,
} from '../schemas/auth.schema';
import { AdminUser } from '@prisma/client';

@Controller('admin/auth')
@UseGuards(AdminAuthGuard)
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  /**
   * 管理员登录
   */
  @Public()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(AdminLoginSchema)) dto: AdminLoginInput,
    @Req() req: Request,
  ) {
    const ip = this.getClientIp(req);
    return this.authService.login(dto, ip);
  }

  /**
   * 刷新 Token
   */
  @Public()
  @Post('refresh')
  async refreshToken(
    @Body(new ZodValidationPipe(RefreshTokenSchema)) dto: RefreshTokenInput,
  ) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  /**
   * 登出
   */
  @Post('logout')
  async logout(@CurrentAdmin() admin: AdminUser) {
    await this.authService.logout(admin.id);
    return { success: true };
  }

  /**
   * 获取客户端 IP
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = typeof forwarded === 'string' ? forwarded : forwarded[0];
      return ips.split(',')[0].trim();
    }
    return req.socket.remoteAddress || '';
  }
}
