/**
 * 模板模块
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TemplateService } from './template.service';
import { ClientTemplateController } from './controllers/client-template.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ClientTemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
