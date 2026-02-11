/**
 * 后台管理模块
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { DashboardController } from './controllers/dashboard.controller';
import { AuditLogController } from './controllers/audit-log.controller';

@Module({
  imports: [JwtModule],
  controllers: [DashboardController, AuditLogController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
