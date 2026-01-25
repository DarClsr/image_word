import type { DashboardOverview, DashboardTrend, DashboardStyleDist, DashboardModelStat } from '@/types/dashboard';
import { get } from './request';

const BASE_URL = '/admin/dashboard';

export const fetchDashboardOverview = () => get<DashboardOverview>(`${BASE_URL}/overview`);

export const fetchDashboardTrend = (range = '7d') =>
  get<DashboardTrend>(`${BASE_URL}/trend`, { params: { range } });

export const fetchDashboardStyleDist = () => get<DashboardStyleDist>(`${BASE_URL}/style-dist`);

export const fetchDashboardModelStat = () => get<DashboardModelStat>(`${BASE_URL}/model-stat`);
