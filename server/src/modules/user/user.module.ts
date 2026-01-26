/**
 * 用户模块
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { ClientUserController } from './controllers/client-user.controller';
import { AdminUserController } from './controllers/admin-user.controller';

@Module({
  imports: [JwtModule],
  controllers: [ClientUserController, AdminUserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
