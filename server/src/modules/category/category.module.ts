/**
 * 分类模块
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CategoryService } from './category.service';
import { ClientCategoryController } from './controllers/client-category.controller';
import { AdminCategoryController } from './controllers/admin-category.controller';

@Module({
  imports: [JwtModule],
  controllers: [ClientCategoryController, AdminCategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
