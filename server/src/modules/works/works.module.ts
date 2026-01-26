/**
 * 作品模块
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WorksService } from './works.service';
import { ClientWorksController } from './controllers/client-works.controller';
import { AdminWorksController } from './controllers/admin-works.controller';

@Module({
  imports: [JwtModule],
  controllers: [ClientWorksController, AdminWorksController],
  providers: [WorksService],
  exports: [WorksService],
})
export class WorksModule {}
