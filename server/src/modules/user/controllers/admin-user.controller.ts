/**
 * 管理端用户控制器
 */
import { Controller, Get, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { UserService } from '../user.service';
import { AdminAuthGuard, PermissionGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  QueryUserSchema,
  QueryUserInput,
  UpdateQuotaSchema,
  UpdateQuotaInput,
  BanUserSchema,
  BanUserInput,
} from '../schemas/user.schema';
import { AdminUser } from '@prisma/client';

@Controller('admin/user')
@UseGuards(AdminAuthGuard, PermissionGuard)
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 查询用户列表
   */
  @Get()
  @Permissions('user:list')
  async findAll(
    @Query(new ZodValidationPipe(QueryUserSchema)) query: QueryUserInput,
  ) {
    return this.userService.findAll(query);
  }

  /**
   * 获取用户详情
   */
  @Get(':id')
  @Permissions('user:list')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(parseInt(id, 10));
  }

  /**
   * 调整用户额度
   */
  @Put(':id/quota')
  @Permissions('user:update')
  async updateQuota(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateQuotaSchema)) dto: UpdateQuotaInput,
    @CurrentAdmin() admin: AdminUser,
  ) {
    return this.userService.updateQuota(parseInt(id, 10), dto, admin.id);
  }

  /**
   * 封禁用户
   */
  @Put(':id/ban')
  @Permissions('user:ban')
  async ban(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(BanUserSchema)) dto: BanUserInput,
    @CurrentAdmin() admin: AdminUser,
  ) {
    return this.userService.ban(parseInt(id, 10), dto.reason, admin.id);
  }

  /**
   * 解封用户
   */
  @Put(':id/unban')
  @Permissions('user:ban')
  async unban(@Param('id') id: string, @CurrentAdmin() admin: AdminUser) {
    return this.userService.unban(parseInt(id, 10), admin.id);
  }
}
