/**
 * 管理端分类控制器
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from '../category.service';
import { AdminAuthGuard, PermissionGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  CreateCategorySchema,
  CreateCategoryInput,
  UpdateCategorySchema,
  UpdateCategoryInput,
  QueryCategorySchema,
  QueryCategoryInput,
  SortCategorySchema,
  SortCategoryInput,
} from '../schemas/category.schema';

@Controller('admin/category')
@UseGuards(AdminAuthGuard, PermissionGuard)
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 创建分类
   */
  @Post()
  @Permissions('category:create')
  async create(
    @Body(new ZodValidationPipe(CreateCategorySchema)) dto: CreateCategoryInput,
  ) {
    return this.categoryService.create(dto);
  }

  /**
   * 查询分类列表
   */
  @Get()
  @Permissions('category:list')
  async findAll(
    @Query(new ZodValidationPipe(QueryCategorySchema)) query: QueryCategoryInput,
  ) {
    return this.categoryService.findAll(query);
  }

  /**
   * 获取分类详情
   */
  @Get(':id')
  @Permissions('category:list')
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(parseInt(id, 10));
  }

  /**
   * 更新分类
   */
  @Put(':id')
  @Permissions('category:update')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCategorySchema)) dto: UpdateCategoryInput,
  ) {
    return this.categoryService.update(parseInt(id, 10), dto);
  }

  /**
   * 删除分类
   */
  @Delete(':id')
  @Permissions('category:delete')
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(parseInt(id, 10));
  }

  /**
   * 批量更新排序
   */
  @Put('sort')
  @Permissions('category:update')
  async updateSort(
    @Body(new ZodValidationPipe(SortCategorySchema)) dto: SortCategoryInput,
  ) {
    return this.categoryService.updateSort(dto);
  }

  /**
   * 切换状态
   */
  @Put(':id/status')
  @Permissions('category:update')
  async toggleStatus(@Param('id') id: string) {
    return this.categoryService.toggleStatus(parseInt(id, 10));
  }
}
