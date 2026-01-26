/**
 * 任务模块
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TaskService } from './task.service';
import { ClientTaskController } from './controllers/client-task.controller';

@Module({
  imports: [JwtModule],
  controllers: [ClientTaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
