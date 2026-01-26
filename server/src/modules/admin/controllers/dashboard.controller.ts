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
  async getTrend(@Query('days') days?: string) {
    return this.adminService.getTrend(days ? parseInt(days, 10) : 7);
  }

  /**
   * 获取分布数据
   */
  @Get('distribution')
  @Permissions('dashboard:view')
  async getDistribution() {
    return this.adminService.getDistribution();
  }
}
