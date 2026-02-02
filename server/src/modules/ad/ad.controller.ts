/**
 * 广告激励 API 控制器
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdService } from './ad.service';
import { ClientAuthGuard } from '../../common/guards';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { z } from 'zod';

/**
 * 开始观看广告 Schema
 */
const StartAdViewSchema = z.object({
  adType: z.enum(['video', 'rewarded', 'interstitial']).optional(),
  adUnitId: z.string().optional(),
  provider: z.enum(['wechat', 'tencent', 'baidu']).optional(),
});

type StartAdViewInput = z.infer<typeof StartAdViewSchema>;

/**
 * 完成观看广告 Schema
 */
const CompleteAdViewSchema = z.object({
  adViewId: z.number(),
});

type CompleteAdViewInput = z.infer<typeof CompleteAdViewSchema>;

/**
 * 领取奖励 Schema
 */
const ClaimRewardSchema = z.object({
  adViewId: z.number(),
});

type ClaimRewardInput = z.infer<typeof ClaimRewardSchema>;

/**
 * 标记失败 Schema
 */
const MarkFailedSchema = z.object({
  adViewId: z.number(),
  reason: z.string().optional(),
});

type MarkFailedInput = z.infer<typeof MarkFailedSchema>;

@Controller('client/ad')
@UseGuards(ClientAuthGuard)
export class AdController {
  constructor(private readonly adService: AdService) {}

  /**
   * 获取广告配置和今日统计
   * @description 获取用户今日广告观看情况和剩余次数
   */
  @Get('config')
  async getConfig(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const [config, stats] = await Promise.all([
      this.adService.getConfig(),
      this.adService.getDailyStats(userId),
    ]);

    return {
      config,
      stats,
    };
  }

  /**
   * 开始观看广告
   * @description 创建广告观看记录，检查观看限制
   */
  @Post('start')
  async startView(
    @Body(new ZodValidationPipe(StartAdViewSchema)) dto: StartAdViewInput,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    const clientIp = req.ip || '';

    return this.adService.startView({
      userId,
      adType: dto.adType,
      adUnitId: dto.adUnitId,
      provider: dto.provider,
      ip: clientIp,
    });
  }

  /**
   * 完成广告观看
   * @description 用户看完广告后调用，更新观看状态
   */
  @Post('complete')
  async completeView(
    @Body(new ZodValidationPipe(CompleteAdViewSchema)) dto: CompleteAdViewInput,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    return this.adService.completeView({
      userId,
      adViewId: dto.adViewId,
    });
  }

  /**
   * 领取广告奖励
   * @description 观看完成后领取额度奖励
   */
  @Post('claim')
  async claimReward(
    @Body(new ZodValidationPipe(ClaimRewardSchema)) dto: ClaimRewardInput,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    return this.adService.claimReward(userId, dto.adViewId);
  }

  /**
   * 标记广告观看失败
   * @description 广告加载失败或用户关闭时调用
   */
  @Post('fail')
  async markFailed(
    @Body(new ZodValidationPipe(MarkFailedSchema)) dto: MarkFailedInput,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    return this.adService.markFailed(userId, dto.adViewId, dto.reason);
  }

  /**
   * 获取广告观看历史
   * @description 获取用户的广告观看记录
   */
  @Get('history')
  async getHistory(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    return this.adService.getViewHistory(
      userId,
      parseInt(page, 10),
      parseInt(pageSize, 10),
    );
  }
}

/**
 * 带用户信息的请求
 */
interface RequestWithUser extends Request {
  user: {
    userId: number;
    openid: string;
  };
}
