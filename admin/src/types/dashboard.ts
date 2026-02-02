/**
 * 统计卡片数据
 */
export interface StatCardData {
  value: number | string;
  change?: string;
  changeUp?: boolean;
}

/**
 * 仪表盘概览数据（后端返回格式）
 */
export interface DashboardOverview {
  todayGeneration: StatCardData;
  activeUsers: StatCardData;
  passRate: StatCardData;
  pendingAudit: { value: number };
  users: { total: number; today: number };
  works: { total: number; today: number; pending: number };
  tasks: { total: number; processing: number };
}

/**
 * 趋势数据点
 */
export interface TrendDataPoint {
  date: string;
  users: number;
  works: number;
}

/**
 * 趋势数据（后端返回格式）
 */
export type DashboardTrend = TrendDataPoint[];

/**
 * 风格分布数据
 */
export interface StyleDistItem {
  name: string;
  value: number;
  color?: string;
}

export type DashboardStyleDist = StyleDistItem[];

/**
 * 模型统计数据
 */
export interface DashboardModelStat {
  xAxis: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

/**
 * 最新作品
 */
export interface RecentWork {
  id: number;
  prompt: string;
  style: string;
  thumbnail: string;
  time: string;
  user: string;
}
