/**
 * Admin 广告管理 API 控制器
 */
import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdService } from './ad.service';
import { AdminAuthGuard } from '../../common/guards';
import { PrismaService } from '../../shared/prisma/prisma.service';
import * as dayjs from 'dayjs';

@Controller('admin/ad')
@UseGuards(AdminAuthGuard)
export class AdminAdController {
  constructor(
    private readonly adService: AdService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 获取广告统计概览
   */
  @Get('stats')
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? dayjs(startDate).startOf('day').toDate() : dayjs().subtract(30, 'day').startOf('day').toDate();
    const end = endDate ? dayjs(endDate).endOf('day').toDate() : dayjs().endOf('day').toDate();

    // 总观看次数
    const totalViews = await this.prisma.adView.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // 完成观看次数
    const completedViews = await this.prisma.adView.count({
      where: {
        status: 'completed',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // 已发放奖励次数
    const rewardedCount = await this.prisma.adView.count({
      where: {
        rewarded: true,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // 总发放额度
    const totalRewardQuota = await this.prisma.adView.aggregate({
      where: {
        rewarded: true,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        rewardQuota: true,
      },
    });

    // 独立用户数
    const uniqueUsers = await this.prisma.adView.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // 今日数据
    const today = dayjs().format('YYYY-MM-DD');
    const todayStats = await this.prisma.adDailyStats.aggregate({
      where: { date: today },
      _sum: {
        viewCount: true,
        rewardCount: true,
        totalRewardQuota: true,
      },
    });

    // 按日期统计
    const dailyStats = await this.prisma.adDailyStats.findMany({
      where: {
        date: {
          gte: dayjs(start).format('YYYY-MM-DD'),
          lte: dayjs(end).format('YYYY-MM-DD'),
        },
      },
      orderBy: { date: 'asc' },
    });

    return {
      overview: {
        totalViews,
        completedViews,
        completionRate: totalViews > 0 ? ((completedViews / totalViews) * 100).toFixed(2) + '%' : '0%',
        rewardedCount,
        totalRewardQuota: totalRewardQuota._sum.rewardQuota || 0,
        uniqueUsers: uniqueUsers.length,
      },
      today: {
        viewCount: todayStats._sum.viewCount || 0,
        rewardCount: todayStats._sum.rewardCount || 0,
        totalRewardQuota: todayStats._sum.totalRewardQuota || 0,
      },
      dailyStats,
    };
  }

  /**
   * 获取广告观看记录列表
   */
  @Get('list')
  async getList(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const take = parseInt(pageSize, 10);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = parseInt(userId, 10);
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = dayjs(startDate).startOf('day').toDate();
      }
      if (endDate) {
        where.createdAt.lte = dayjs(endDate).endOf('day').toDate();
      }
    }

    const [list, total] = await Promise.all([
      this.prisma.adView.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.adView.count({ where }),
    ]);

    return {
      list,
      total,
      page: parseInt(page, 10),
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * 获取用户广告统计排行
   */
  @Get('user-rank')
  async getUserRank(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const take = parseInt(pageSize, 10);

    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.gte = dayjs(startDate).format('YYYY-MM-DD');
      }
      if (endDate) {
        dateFilter.lte = dayjs(endDate).format('YYYY-MM-DD');
      }
    } else {
      // 默认最近30天
      dateFilter.gte = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    }

    // 按用户统计
    const userStats = await this.prisma.adDailyStats.groupBy({
      by: ['userId'],
      where: {
        date: dateFilter,
      },
      _sum: {
        viewCount: true,
        rewardCount: true,
        totalRewardQuota: true,
      },
      orderBy: {
        _sum: {
          viewCount: 'desc',
        },
      },
      skip,
      take,
    });

    // 获取用户信息
    const userIds = userStats.map(s => s.userId);
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        nickname: true,
        avatar: true,
      },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const list = userStats.map(stat => ({
      userId: stat.userId,
      user: userMap.get(stat.userId),
      viewCount: stat._sum.viewCount || 0,
      rewardCount: stat._sum.rewardCount || 0,
      totalRewardQuota: stat._sum.totalRewardQuota || 0,
    }));

    // 获取总数
    const totalResult = await this.prisma.adDailyStats.groupBy({
      by: ['userId'],
      where: {
        date: dateFilter,
      },
    });

    return {
      list,
      total: totalResult.length,
      page: parseInt(page, 10),
      pageSize: take,
      totalPages: Math.ceil(totalResult.length / take),
    };
  }

  /**
   * 获取广告配置
   */
  @Get('config')
  async getConfig() {
    return this.adService.getConfig();
  }
}
