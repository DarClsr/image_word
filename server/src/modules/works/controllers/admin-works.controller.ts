/**
 * 管理端作品控制器
 */
import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WorksService } from '../works.service';
import { AdminAuthGuard, PermissionGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  QueryWorksSchema,
  QueryWorksInput,
  AuditWorksSchema,
  AuditWorksInput,
  BatchAuditWorksSchema,
  BatchAuditWorksInput,
} from '../schemas/works.schema';
import { AdminUser } from '@prisma/client';

@Controller('admin/works')
@UseGuards(AdminAuthGuard, PermissionGuard)
export class AdminWorksController {
  constructor(private readonly worksService: WorksService) {}

  /**
   * 查询作品列表
   */
  @Get()
  @Permissions('works:list')
  async findAll(
    @Query(new ZodValidationPipe(QueryWorksSchema)) query: QueryWorksInput,
  ) {
    return this.worksService.findAll(query);
  }

  /**
   * 获取作品详情
   */
  @Get(':id')
  @Permissions('works:list')
  async findOne(@Param('id') id: string) {
    return this.worksService.findOne(parseInt(id, 10));
  }

  /**
   * 审核作品
   */
  @Put(':id/audit')
  @Permissions('works:audit')
  async audit(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AuditWorksSchema)) dto: AuditWorksInput,
    @CurrentAdmin() admin: AdminUser,
  ) {
    return this.worksService.audit(parseInt(id, 10), dto, admin.id);
  }

  /**
   * 批量审核
   */
  @Put('batch-audit')
  @Permissions('works:audit')
  async batchAudit(
    @Body(new ZodValidationPipe(BatchAuditWorksSchema)) dto: BatchAuditWorksInput,
    @CurrentAdmin() admin: AdminUser,
  ) {
    return this.worksService.batchAudit(dto, admin.id);
  }

  /**
   * 删除作品
   */
  @Delete(':id')
  @Permissions('works:delete')
  async remove(@Param('id') id: string, @CurrentAdmin() admin: AdminUser) {
    return this.worksService.adminRemove(parseInt(id, 10), admin.id);
  }
}
