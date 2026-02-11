/**
 * 审计日志控制器
 */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { AdminAuthGuard, PermissionGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { QueryAuditLogSchema, QueryAuditLogInput } from '../schemas/audit-log.schema';

@Controller('admin/audit-log')
@UseGuards(AdminAuthGuard, PermissionGuard)
export class AuditLogController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 查询审计日志
   */
  @Get()
  @Permissions('audit-log:list')
  async findAll(
    @Query(new ZodValidationPipe(QueryAuditLogSchema)) query: QueryAuditLogInput,
  ) {
    return this.adminService.getAuditLogs(query);
  }
}
