/**
 * 系统配置控制器（管理端）
 */
import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { SystemService } from '../system.service';
import { AdminAuthGuard, PermissionGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { UpdateSystemConfigSchema, UpdateSystemConfigInput, UpdateGenerationConfigSchema, UpdateGenerationConfigInput } from '../schemas/system.schema';

@Controller('admin/system')
@UseGuards(AdminAuthGuard, PermissionGuard)
export class AdminSystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('config')
  @Permissions('system:config:read')
  async getConfig() {
    return this.systemService.getSystemConfig();
  }

  @Put('config')
  @Permissions('system:config:update')
  async updateConfig(
    @Body(new ZodValidationPipe(UpdateSystemConfigSchema)) dto: UpdateSystemConfigInput,
  ) {
    return this.systemService.updateSystemConfig(dto);
  }

  @Get('generation')
  @Permissions('system:generation:read')
  async getGeneration() {
    return this.systemService.getGenerationConfig();
  }

  @Put('generation')
  @Permissions('system:generation:update')
  async updateGeneration(
    @Body(new ZodValidationPipe(UpdateGenerationConfigSchema)) dto: UpdateGenerationConfigInput,
  ) {
    return this.systemService.updateGenerationConfig(dto);
  }
}
