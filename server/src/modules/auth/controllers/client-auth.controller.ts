/**
 * 小程序端认证控制器
 */
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ClientAuthService } from '../services/client-auth.service';
import { Public, CurrentUser } from '../../../common/decorators';
import { ClientAuthGuard } from '../../../common/guards';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  WechatLoginSchema,
  WechatLoginInput,
  RefreshTokenSchema,
  RefreshTokenInput,
} from '../schemas/auth.schema';
import { User } from '@prisma/client';

@Controller('client/auth')
@UseGuards(ClientAuthGuard)
export class ClientAuthController {
  constructor(private readonly authService: ClientAuthService) {}

  /**
   * 微信登录
   */
  @Public()
  @Post('wechat-login')
  async wechatLogin(
    @Body(new ZodValidationPipe(WechatLoginSchema)) dto: WechatLoginInput,
  ) {
    return this.authService.wechatLogin(dto);
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
   * 获取用户信息
   */
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  /**
   * 登出
   */
  @Post('logout')
  async logout(@CurrentUser() user: User) {
    await this.authService.logout(user.id);
    return { success: true };
  }
}
