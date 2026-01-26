import dayjs from 'dayjs';

/**
 * 格式化工具函数
 */

/**
 * 格式化日期时间
 * @param date 日期
 * @param format 格式，默认 'YYYY-MM-DD HH:mm:ss'
 */
export const formatDateTime = (
  date: string | number | Date | undefined,
  format = 'YYYY-MM-DD HH:mm:ss'
): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * 格式化日期
 */
export const formatDate = (date: string | number | Date | undefined): string => {
  return formatDateTime(date, 'YYYY-MM-DD');
};

/**
 * 格式化时间
 */
export const formatTime = (date: string | number | Date | undefined): string => {
  return formatDateTime(date, 'HH:mm:ss');
};

/**
 * 相对时间（几分钟前、几小时前）
 */
export const formatRelativeTime = (date: string | number | Date): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diff = now.diff(target, 'second');

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
  return formatDate(date);
};

/**
 * 格式化数字（千分位）
 */
export const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return '-';
  return num.toLocaleString('zh-CN');
};

/**
 * 格式化金额
 */
export const formatMoney = (amount: number | undefined, prefix = '¥'): string => {
  if (amount === undefined || amount === null) return '-';
  return `${prefix} ${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * 格式化百分比
 */
export const formatPercent = (value: number | undefined, decimals = 1): string => {
  if (value === undefined || value === null) return '-';
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
};

/**
 * 手机号脱敏
 */
export const maskPhone = (phone: string | undefined): string => {
  if (!phone || phone.length !== 11) return phone || '-';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 身份证脱敏
 */
export const maskIdCard = (idCard: string | undefined): string => {
  if (!idCard || idCard.length < 15) return idCard || '-';
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2');
};

/**
 * 邮箱脱敏
 */
export const maskEmail = (email: string | undefined): string => {
  if (!email || !email.includes('@')) return email || '-';
  const [name, domain] = email.split('@');
  if (!name) return email;
  const maskedName = name.length > 2 ? name[0] + '***' + name.slice(-1) : name[0] + '***';
  return `${maskedName}@${domain}`;
};

/**
 * OpenID 脱敏
 */
export const maskOpenId = (openId: string | undefined): string => {
  if (!openId || openId.length < 10) return openId || '-';
  return openId.slice(0, 6) + '****' + openId.slice(-4);
};

/**
 * 截断文本
 */
export const truncateText = (text: string | undefined, length: number, suffix = '...'): string => {
  if (!text) return '-';
  if (text.length <= length) return text;
  return text.slice(0, length) + suffix;
};

/**
 * 状态文本映射
 */
export const formatStatus = (
  status: number | string,
  map: Record<number | string, string>
): string => {
  return map[status] || String(status);
};
