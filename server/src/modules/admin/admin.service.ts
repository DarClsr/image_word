/**
 * 后台管理服务
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取仪表盘概览数据
   */
  async getDashboardOverview() {
    const today = dayjs().startOf('day').toDate();
    const yesterday = dayjs().subtract(1, 'day').startOf('day').toDate();

    // 并行查询
    const [
      totalUsers,
      todayUsers,
      totalWorks,
      todayWorks,
      pendingWorks,
      totalTasks,
      processingTasks,
    ] = await Promise.all([
      // 总用户数
      this.prisma.user.count(),
      // 今日新增用户
      this.prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      // 总作品数
      this.prisma.works.count(),
      // 今日新增作品
      this.prisma.works.count({
        where: { createdAt: { gte: today } },
      }),
      // 待审核作品
      this.prisma.works.count({
        where: { status: 'pending' },
      }),
      // 总任务数
      this.prisma.task.count(),
      // 处理中任务
      this.prisma.task.count({
        where: { status: { in: ['pending', 'processing'] } },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        today: todayUsers,
      },
      works: {
        total: totalWorks,
        today: todayWorks,
        pending: pendingWorks,
      },
      tasks: {
        total: totalTasks,
        processing: processingTasks,
      },
    };
  }

  /**
   * 获取趋势数据
   */
  async getTrend(days: number = 7) {
    const startDate = dayjs().subtract(days - 1, 'day').startOf('day').toDate();

    // 获取每日用户注册数
    const userTrend = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // 获取每日作品数
    const worksTrend = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM works
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // 填充空日期
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = dayjs().subtract(days - 1 - i, 'day').format('YYYY-MM-DD');
      const userCount = userTrend.find(
        (item) => dayjs(item.date).format('YYYY-MM-DD') === date,
      );
      const worksCount = worksTrend.find(
        (item) => dayjs(item.date).format('YYYY-MM-DD') === date,
      );

      result.push({
        date,
        users: userCount ? Number(userCount.count) : 0,
        works: worksCount ? Number(worksCount.count) : 0,
      });
    }

    return result;
  }

  /**
   * 获取分布数据
   */
  async getDistribution() {
    // 风格分布
    const styleDistribution = await this.prisma.works.groupBy({
      by: ['styleId'],
      _count: true,
    });

    const styles = await this.prisma.category.findMany({
      where: { type: 'style' },
      select: { id: true, name: true },
    });

    const styleData = styleDistribution.map((item) => {
      const style = styles.find((s) => s.id === item.styleId);
      return {
        name: style?.name || '未知',
        value: item._count,
      };
    });

    // 模型分布
    const modelDistribution = await this.prisma.works.groupBy({
      by: ['modelId'],
      _count: true,
    });

    const models = await this.prisma.category.findMany({
      where: { type: 'model' },
      select: { id: true, name: true },
    });

    const modelData = modelDistribution.map((item) => {
      const model = models.find((m) => m.id === item.modelId);
      return {
        name: model?.name || '未知',
        value: item._count,
      };
    });

    // 会员分布
    const memberDistribution = await this.prisma.user.groupBy({
      by: ['memberType'],
      _count: true,
    });

    const memberData = memberDistribution.map((item) => ({
      name: item.memberType === 'free' ? '免费用户' : item.memberType === 'basic' ? '基础会员' : 'Pro会员',
      value: item._count,
    }));

    return {
      style: styleData,
      model: modelData,
      member: memberData,
    };
  }
}
