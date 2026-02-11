/**
 * 系统配置模块
 */
import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { AdminSystemController } from './controllers/admin-system.controller';

@Module({
  controllers: [AdminSystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
