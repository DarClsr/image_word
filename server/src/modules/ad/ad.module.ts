/**
 * 广告激励模块
 */
import { Module } from '@nestjs/common';
import { AdService } from './ad.service';
import { AdController } from './ad.controller';
import { AdminAdController } from './admin-ad.controller';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Module({
  controllers: [AdController, AdminAdController],
  providers: [AdService, PrismaService],
  exports: [AdService],
})
export class AdModule {}
