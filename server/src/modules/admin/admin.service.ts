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
    const yesterdayEnd = dayjs().subtract(1, 'day').endOf('day').toDate();

    // 并行查询今日和昨日数据
    const [
      totalUsers,
      todayUsers,
      yesterdayUsers,
      totalWorks,
      todayWorks,
      yesterdayWorks,
      pendingWorks,
      approvedWorks,
      totalTasks,
      processingTasks,
    ] = await Promise.all([
      // 总用户数
      this.prisma.user.count(),
      // 今日新增用户
      this.prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      // 昨日新增用户
      this.prisma.user.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
      // 总作品数
      this.prisma.works.count(),
      // 今日新增作品
      this.prisma.works.count({
        where: { createdAt: { gte: today } },
      }),
      // 昨日新增作品
      this.prisma.works.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
      // 待审核作品
      this.prisma.works.count({
        where: { status: 'pending' },
      }),
      // 已审核通过作品
      this.prisma.works.count({
        where: { status: 'approved' },
      }),
      // 总任务数
      this.prisma.task.count(),
      // 处理中任务
      this.prisma.task.count({
        where: { status: { in: ['pending', 'processing'] } },
      }),
    ]);

    // 计算增长率
    const calcChange = (today: number, yesterday: number): { change: string; changeUp: boolean } => {
      if (yesterday === 0) {
        return { change: today > 0 ? '+100%' : '0%', changeUp: today > 0 };
      }
      const rate = ((today - yesterday) / yesterday * 100).toFixed(1);
      return {
        change: `${Number(rate) >= 0 ? '+' : ''}${rate}%`,
        changeUp: Number(rate) >= 0,
      };
    };

    // 计算审核通过率
    const passRate = totalWorks > 0 ? ((approvedWorks / totalWorks) * 100).toFixed(1) : '0';

    return {
      todayGeneration: {
        value: todayWorks,
        ...calcChange(todayWorks, yesterdayWorks),
      },
      activeUsers: {
        value: todayUsers,
        ...calcChange(todayUsers, yesterdayUsers),
      },
      passRate: {
        value: `${passRate}%`,
        change: '+0%',
        changeUp: true,
      },
      pendingAudit: {
        value: pendingWorks,
      },
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

  /**
   * 获取风格分布（用于饼图）
   */
  async getStyleDistribution() {
    const styleDistribution = await this.prisma.works.groupBy({
      by: ['styleId'],
      _count: true,
    });

    const styles = await this.prisma.category.findMany({
      where: { type: 'style' },
      select: { id: true, name: true },
    });

    // 预设颜色
    const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6', '#6b7280', '#ec4899', '#14b8a6'];

    return styleDistribution.map((item, index) => {
      const style = styles.find((s) => s.id === item.styleId);
      return {
        name: style?.name || '未知',
        value: item._count,
        color: colors[index % colors.length],
      };
    });
  }

  /**
   * 获取模型统计（用于柱状图）
   */
  async getModelStat() {
    const modelDistribution = await this.prisma.works.groupBy({
      by: ['modelId'],
      _count: true,
    });

    const models = await this.prisma.category.findMany({
      where: { type: 'model' },
      select: { id: true, name: true },
    });

    const xAxis = modelDistribution.map((item) => {
      const model = models.find((m) => m.id === item.modelId);
      return model?.name || '未知';
    });

    const data = modelDistribution.map((item) => item._count);

    return {
      xAxis,
      series: [
        {
          name: '调用次数',
          data,
        },
      ],
    };
  }

  /**
   * 获取最新作品
   */
  async getRecentWorks(limit: number = 5) {
    const works = await this.prisma.works.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { nickname: true } },
        style: { select: { name: true } },
      },
    });

    return works.map((work) => ({
      id: work.id,
      prompt: work.prompt.length > 30 ? work.prompt.substring(0, 30) + '...' : work.prompt,
      style: work.style?.name || '未知',
      thumbnail: work.thumbnailUrl || work.imageUrl,
      time: this.formatRelativeTime(work.createdAt),
      user: work.user?.nickname || '未知用户',
    }));
  }

  /**
   * 格式化相对时间
   */
  private formatRelativeTime(date: Date): string {
    const now = dayjs();
    const target = dayjs(date);
    const diffMinutes = now.diff(target, 'minute');

    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;

    const diffHours = now.diff(target, 'hour');
    if (diffHours < 24) return `${diffHours}小时前`;

    const diffDays = now.diff(target, 'day');
    if (diffDays < 7) return `${diffDays}天前`;

    return target.format('MM-DD HH:mm');
  }
}
