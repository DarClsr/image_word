import type { 
  DashboardOverview, 
  DashboardTrend, 
  DashboardStyleDist, 
  DashboardModelStat, 
  RecentWork 
} from '@/types/dashboard';
import { get } from './request';

const BASE_URL = '/admin/dashboard';

/** 获取概览数据 */
export const fetchDashboardOverview = () => get<DashboardOverview>(`${BASE_URL}/overview`);

/** 获取趋势数据 */
export const fetchDashboardTrend = (range: '7d' | '30d' = '7d') =>
  get<DashboardTrend>(`${BASE_URL}/trend`, { params: { range } });

/** 获取风格分布 */
export const fetchDashboardStyleDist = () => get<DashboardStyleDist>(`${BASE_URL}/style-dist`);

/** 获取模型统计 */
export const fetchDashboardModelStat = () => get<DashboardModelStat>(`${BASE_URL}/model-stat`);

/** 获取最新作品 */
export const fetchRecentWorks = (limit = 5) => 
  get<RecentWork[]>(`${BASE_URL}/recent-works`, { params: { limit } });
