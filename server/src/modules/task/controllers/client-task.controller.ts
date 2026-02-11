/**
 * 小程序端任务控制器
 */
import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { TaskService } from '../task.service';
import { ClientAuthGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { QueryTaskSchema, QueryTaskInput } from '../schemas/task.schema';
import { User } from '@prisma/client';

@Controller('client/task')
@UseGuards(ClientAuthGuard)
export class ClientTaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * 查询任务状态
   */
  @Get(':taskId')
  async getStatus(@Param('taskId') taskId: string, @CurrentUser() user: User) {
    return this.taskService.getStatus(taskId, user.id);
  }

  /**
   * 取消任务
   */
  @Delete(':taskId')
  async cancel(@Param('taskId') taskId: string, @CurrentUser() user: User) {
    return this.taskService.cancel(taskId, user.id);
  }

  /**
   * 获取我的任务列表
   */
  @Get()
  async findMyTasks(
    @Query(new ZodValidationPipe(QueryTaskSchema)) query: QueryTaskInput,
    @CurrentUser() user: User,
  ) {
    return this.taskService.findByUser(user.id, query.status);
  }
}
