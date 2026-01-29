/**
 * 仪表盘控制器
 */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { AdminAuthGuard, PermissionGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators';

@Controller('admin/dashboard')
@UseGuards(AdminAuthGuard, PermissionGuard)
export class DashboardController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 获取概览数据
   */
  @Get('overview')
  @Permissions('dashboard:view')
  async getOverview() {
    return this.adminService.getDashboardOverview();
  }

  /**
   * 获取趋势数据
   */
  @Get('trend')
  @Permissions('dashboard:view')
  async getTrend(@Query('range') range?: string) {
    // 支持 '7d' 或 '30d' 格式
    const days = range === '30d' ? 30 : 7;
    return this.adminService.getTrend(days);
  }

  /**
   * 获取风格分布数据
   */
  @Get('style-dist')
  @Permissions('dashboard:view')
  async getStyleDistribution() {
    return this.adminService.getStyleDistribution();
  }

  /**
   * 获取模型统计数据
   */
  @Get('model-stat')
  @Permissions('dashboard:view')
  async getModelStat() {
    return this.adminService.getModelStat();
  }

  /**
   * 获取最新作品
   */
  @Get('recent-works')
  @Permissions('dashboard:view')
  async getRecentWorks(@Query('limit') limit?: string) {
    return this.adminService.getRecentWorks(limit ? parseInt(limit, 10) : 5);
  }
}
