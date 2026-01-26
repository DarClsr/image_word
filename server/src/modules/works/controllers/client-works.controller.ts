/**
 * 小程序端作品控制器
 */
import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WorksService } from '../works.service';
import { ClientAuthGuard } from '../../../common/guards';
import { CurrentUser, Public } from '../../../common/decorators';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { CreateWorksSchema, CreateWorksInput, QueryWorksSchema, QueryWorksInput } from '../schemas/works.schema';
import { User } from '@prisma/client';

@Controller('client/works')
@UseGuards(ClientAuthGuard)
export class ClientWorksController {
  constructor(private readonly worksService: WorksService) {}

  /**
   * 创建作品（提交生成任务）
   */
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateWorksSchema)) dto: CreateWorksInput,
    @CurrentUser() user: User,
  ) {
    return this.worksService.create(dto, user.id);
  }

  /**
   * 获取我的作品列表
   */
  @Get()
  async findMyWorks(
    @Query(new ZodValidationPipe(QueryWorksSchema)) query: QueryWorksInput,
    @CurrentUser() user: User,
  ) {
    return this.worksService.findByUser(user.id, query);
  }

  /**
   * 获取公开作品（广场）
   */
  @Public()
  @Get('public')
  async findPublic(
    @Query(new ZodValidationPipe(QueryWorksSchema)) query: QueryWorksInput,
  ) {
    return this.worksService.findPublic(query);
  }

  /**
   * 获取作品详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.worksService.findOne(parseInt(id, 10), user?.id);
  }

  /**
   * 删除作品
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.worksService.remove(parseInt(id, 10), user.id);
  }
}
