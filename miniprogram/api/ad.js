/**
 * 广告激励相关 API
 */
import { get, post } from '../utils/request';

const BASE_URL = '/client/ad';

/**
 * 获取广告配置和今日统计
 */
export const fetchAdConfig = () => get(`${BASE_URL}/config`);

/**
 * 开始观看广告
 * @param {Object} data - 广告信息
 * @param {string} data.adType - 广告类型
 * @param {string} data.adUnitId - 广告单元ID
 * @param {string} data.provider - 广告提供商
 */
export const startAdView = (data) => post(`${BASE_URL}/start`, data);

/**
 * 完成广告观看
 * @param {Object} data
 * @param {number} data.adViewId - 广告观看记录ID
 */
export const completeAdView = (data) => post(`${BASE_URL}/complete`, data);

/**
 * 领取广告奖励
 * @param {Object} data
 * @param {number} data.adViewId - 广告观看记录ID
 */
export const claimAdReward = (data) => post(`${BASE_URL}/claim`, data);

/**
 * 标记广告观看失败
 * @param {Object} data
 * @param {number} data.adViewId - 广告观看记录ID
 * @param {string} data.reason - 失败原因
 */
export const markAdFailed = (data) => post(`${BASE_URL}/fail`, data);

/**
 * 获取广告观看历史
 * @param {Object} params
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 */
export const fetchAdHistory = (params) => get(`${BASE_URL}/history`, params);
