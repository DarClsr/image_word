/**
 * 广告激励模块
 */
import { Module } from '@nestjs/common';
import { AdService } from './ad.service';
import { AdController } from './ad.controller';
import { AdminAdController } from './admin-ad.controller';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { ClientAuthGuard } from '../../common/guards';

@Module({
  imports: [AuthModule],
  controllers: [AdController, AdminAdController],
  providers: [AdService, PrismaService, ClientAuthGuard],
  exports: [AdService],
})
export class AdModule {}
