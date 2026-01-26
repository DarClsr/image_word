/**
 * 小程序端分类控制器
 */
import { Controller, Get } from '@nestjs/common';
import { CategoryService } from '../category.service';
import { Public } from '../../../common/decorators';

@Controller('client/category')
export class ClientCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 获取风格列表
   */
  @Public()
  @Get('styles')
  async getStyles() {
    return this.categoryService.getStyles();
  }

  /**
   * 获取模型列表
   */
  @Public()
  @Get('models')
  async getModels() {
    return this.categoryService.getModels();
  }
}
