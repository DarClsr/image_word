/**
 * 生成配置 API 控制器
 */
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GenerationConfigService } from '../services/generation-config.service';
import { ClientAuthGuard, AdminAuthGuard } from '../../../common/guards';
import { Public } from '../../../common/decorators';

@Controller('client/generation')
export class GenerationConfigController {
  constructor(private readonly configService: GenerationConfigService) {}

  /**
   * 获取生成配置
   * @description 获取风格、模型、比例、数量等配置选项
   * @public 无需登录即可获取
   */
  @Public()
  @Get('config')
  async getConfig() {
    return this.configService.getConfig();
  }
}

/**
 * 管理端配置控制器
 */
@Controller('admin/generation')
@UseGuards(AdminAuthGuard)
export class AdminGenerationConfigController {
  constructor(private readonly configService: GenerationConfigService) {}

  /**
   * 清除配置缓存
   * @description 修改配置后调用，刷新前端获取的配置
   */
  @Post('clear-cache')
  async clearCache() {
    await this.configService.clearCache();
    return { message: '缓存已清除' };
  }
}
