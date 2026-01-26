/**
 * 小程序端用户控制器
 */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from '../user.service';
import { ClientAuthGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';
import { User } from '@prisma/client';

@Controller('client/user')
@UseGuards(ClientAuthGuard)
export class ClientUserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取用户统计数据
   */
  @Get('stats')
  async getStats(@CurrentUser() user: User) {
    return this.userService.getStats(user.id);
  }
}
