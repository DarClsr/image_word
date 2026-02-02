/**
 * 广告激励服务
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import * as dayjs from 'dayjs';

/**
 * 开始观看广告输入
 */
export interface StartAdViewInput {
  userId: number;
  adType?: string;
  adUnitId?: string;
  provider?: string;
  ip?: string;
  deviceId?: string;
}

/**
 * 完成广告观看输入
 */
export interface CompleteAdViewInput {
  userId: number;
  adViewId: number;
}

/**
 * 广告配置
 */
export interface AdConfig {
  /** 每日最大观看次数 */
  dailyMaxViews: number;
  /** 每次观看奖励额度 */
  rewardQuotaPerView: number;
  /** 观看间隔（分钟） */
  viewIntervalMinutes: number;
  /** 是否启用 */
  enabled: boolean;
}

@Injectable()
export class AdService {
  /** 默认广告配置 */
  private readonly defaultConfig: AdConfig = {
    dailyMaxViews: 10,        // 每天最多看10次
    rewardQuotaPerView: 1,    // 每次奖励1点额度
    viewIntervalMinutes: 1,   // 间隔1分钟
    enabled: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取广告配置
   */
  async getConfig(): Promise<AdConfig> {
    // 可以从数据库或缓存读取配置
    return this.defaultConfig;
  }

  /**
   * 获取用户今日广告统计
   */
  async getDailyStats(userId: number) {
    const today = dayjs().format('YYYY-MM-DD');
    
    const stats = await this.prisma.adDailyStats.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const config = await this.getConfig();

    return {
      viewCount: stats?.viewCount || 0,
      rewardCount: stats?.rewardCount || 0,
      totalRewardQuota: stats?.totalRewardQuota || 0,
      dailyMaxViews: config.dailyMaxViews,
      rewardQuotaPerView: config.rewardQuotaPerView,
      remainingViews: Math.max(0, config.dailyMaxViews - (stats?.viewCount || 0)),
    };
  }

  /**
   * 开始观看广告
   */
  async startView(input: StartAdViewInput) {
    const { userId, adType = 'video', adUnitId, provider = 'wechat', ip, deviceId } = input;

    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 检查广告配置
    const config = await this.getConfig();
    if (!config.enabled) {
      throw new BadRequestException('广告功能已禁用');
    }

    // 检查今日观看次数
    const dailyStats = await this.getDailyStats(userId);
    if (dailyStats.remainingViews <= 0) {
      throw new BadRequestException('今日广告观看次数已达上限');
    }

    // 检查观看间隔
    const lastView = await this.prisma.adView.findFirst({
      where: {
        userId,
        status: 'completed',
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    if (lastView?.completedAt) {
      const minutesSinceLastView = dayjs().diff(dayjs(lastView.completedAt), 'minute');
      if (minutesSinceLastView < config.viewIntervalMinutes) {
        throw new BadRequestException(
          `请等待 ${config.viewIntervalMinutes - minutesSinceLastView} 分钟后再次观看`
        );
      }
    }

    // 创建广告观看记录
    const adView = await this.prisma.adView.create({
      data: {
        userId,
        adType,
        adUnitId,
        provider,
        status: 'started',
        rewardQuota: config.rewardQuotaPerView,
        ip,
        deviceId,
      },
    });

    return {
      adViewId: adView.id,
      rewardQuota: config.rewardQuotaPerView,
      dailyRemainingViews: dailyStats.remainingViews - 1,
    };
  }

  /**
   * 完成广告观看并发放奖励
   */
  async completeView(input: CompleteAdViewInput) {
    const { userId, adViewId } = input;

    // 查找广告观看记录
    const adView = await this.prisma.adView.findFirst({
      where: {
        id: adViewId,
        userId,
      },
    });

    if (!adView) {
      throw new BadRequestException('广告观看记录不存在');
    }

    if (adView.status === 'completed') {
      throw new BadRequestException('该广告已观看完成');
    }

    if (adView.status === 'failed') {
      throw new BadRequestException('该广告观看失败');
    }

    // 更新广告观看记录为完成
    await this.prisma.adView.update({
      where: { id: adViewId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // 更新今日统计
    const today = dayjs().format('YYYY-MM-DD');
    await this.prisma.adDailyStats.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        viewCount: { increment: 1 },
      },
      create: {
        userId,
        date: today,
        viewCount: 1,
        rewardCount: 0,
        totalRewardQuota: 0,
      },
    });

    return {
      adViewId,
      status: 'completed',
      message: '广告观看完成，请点击领取奖励',
    };
  }

  /**
   * 领取广告奖励（发放额度）
   */
  async claimReward(userId: number, adViewId: number) {
    // 查找广告观看记录
    const adView = await this.prisma.adView.findFirst({
      where: {
        id: adViewId,
        userId,
        status: 'completed',
      },
    });

    if (!adView) {
      throw new BadRequestException('广告观看记录不存在或未完成');
    }

    if (adView.rewarded) {
      throw new BadRequestException('奖励已领取');
    }

    // 发放额度
    await this.prisma.$transaction(async (tx) => {
      // 更新用户额度
      await tx.user.update({
        where: { id: userId },
        data: {
          totalQuota: {
            increment: adView.rewardQuota,
          },
        },
      });

      // 标记为已奖励
      await tx.adView.update({
        where: { id: adViewId },
        data: {
          rewarded: true,
          rewardedAt: new Date(),
        },
      });

      // 更新今日统计
      const today = dayjs().format('YYYY-MM-DD');
      await tx.adDailyStats.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        update: {
          rewardCount: { increment: 1 },
          totalRewardQuota: { increment: adView.rewardQuota },
        },
        create: {
          userId,
          date: today,
          viewCount: 1,
          rewardCount: 1,
          totalRewardQuota: adView.rewardQuota,
        },
      });
    });

    // 获取最新用户信息
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalQuota: true,
        usedQuota: true,
      },
    });

    return {
      adViewId,
      rewarded: true,
      rewardQuota: adView.rewardQuota,
      totalQuota: user?.totalQuota || 0,
      remainQuota: (user?.totalQuota || 0) - (user?.usedQuota || 0),
      message: `成功领取 ${adView.rewardQuota} 点额度`,
    };
  }

  /**
   * 标记广告观看失败
   */
  async markFailed(userId: number, adViewId: number, reason?: string) {
    const adView = await this.prisma.adView.findFirst({
      where: {
        id: adViewId,
        userId,
      },
    });

    if (!adView) {
      throw new BadRequestException('广告观看记录不存在');
    }

    await this.prisma.adView.update({
      where: { id: adViewId },
      data: {
        status: 'failed',
      },
    });

    return {
      adViewId,
      status: 'failed',
      reason,
    };
  }

  /**
   * 获取用户的广告观看历史
   */
  async getViewHistory(userId: number, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [list, total] = await Promise.all([
      this.prisma.adView.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          adType: true,
          provider: true,
          status: true,
          rewardQuota: true,
          rewarded: true,
          rewardedAt: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      this.prisma.adView.count({ where: { userId } }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
