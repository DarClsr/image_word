/**
 * 系统配置模块
 */
import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { AdminSystemController } from './controllers/admin-system.controller';
import { AuthModule } from '../auth/auth.module';
import { AdminAuthGuard } from '../../common/guards';

@Module({
  imports: [AuthModule],
  controllers: [AdminSystemController],
  providers: [SystemService, AdminAuthGuard],
  exports: [SystemService],
})
export class SystemModule {}
