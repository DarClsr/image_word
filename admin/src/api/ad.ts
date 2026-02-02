/**
 * 广告管理 API
 */
import { get } from '@/utils/request';
import type { ApiListResponse } from '@/types/common';

const BASE_URL = '/admin/ad';

/**
 * 广告观看记录
 */
export interface AdViewRecord {
  id: number;
  userId: number;
  adType: string;
  adUnitId?: string;
  provider: string;
  status: string;
  rewardQuota: number;
  rewarded: boolean;
  rewardedAt?: string;
  ip?: string;
  deviceId?: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  user?: {
    id: number;
    nickname: string;
    avatar: string;
  };
}

/**
 * 广告统计概览
 */
export interface AdStatsOverview {
  totalViews: number;
  completedViews: number;
  completionRate: string;
  rewardedCount: number;
  totalRewardQuota: number;
  uniqueUsers: number;
}

/**
 * 今日统计
 */
export interface AdTodayStats {
  viewCount: number;
  rewardCount: number;
  totalRewardQuota: number;
}

/**
 * 每日统计
 */
export interface AdDailyStats {
  id: number;
  userId: number;
  date: string;
  viewCount: number;
  rewardCount: number;
  totalRewardQuota: number;
}

/**
 * 用户排行
 */
export interface AdUserRank {
  userId: number;
  user?: {
    id: number;
    nickname: string;
    avatar: string;
  };
  viewCount: number;
  rewardCount: number;
  totalRewardQuota: number;
}

/**
 * 广告配置
 */
export interface AdConfig {
  dailyMaxViews: number;
  rewardQuotaPerView: number;
  viewIntervalMinutes: number;
  enabled: boolean;
}

/**
 * 获取广告统计
 */
export const fetchAdStats = (params?: {
  startDate?: string;
  endDate?: string;
}) =>
  get<{
    overview: AdStatsOverview;
    today: AdTodayStats;
    dailyStats: AdDailyStats[];
  }>(`${BASE_URL}/stats`, params);

/**
 * 获取广告观看记录列表
 */
export const fetchAdList = (params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
}) => get<ApiListResponse<AdViewRecord>>(`${BASE_URL}/list`, params);

/**
 * 获取用户排行
 */
export const fetchAdUserRank = (params?: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}) => get<ApiListResponse<AdUserRank>>(`${BASE_URL}/user-rank`, params);

/**
 * 获取广告配置
 */
export const fetchAdConfig = () => get<AdConfig>(`${BASE_URL}/config`);
