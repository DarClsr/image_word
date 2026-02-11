/**
 * 小程序端模板控制器
 */
import { Controller, Get, Param, Query } from '@nestjs/common';
import { TemplateService } from '../template.service';
import { Public } from '../../../common/decorators';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { QueryTemplateSchema, QueryTemplateInput } from '../schemas/template.schema';

@Controller('client/templates')
export class ClientTemplateController {
  constructor(private readonly templateService: TemplateService) {}

  /**
   * 获取模板列表
   */
  @Public()
  @Get()
  async findAll(
    @Query(new ZodValidationPipe(QueryTemplateSchema)) query: QueryTemplateInput,
  ) {
    return this.templateService.findAll(query);
  }

  /**
   * 获取模板详情
   */
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.templateService.findOne(parseInt(id, 10));
  }
}
