/**
 * 本地存储封装
 */

const PREFIX = 'iw_admin_';

/**
 * 获取带前缀的 key
 */
const getKey = (key: string): string => `${PREFIX}${key}`;

/**
 * 设置 localStorage
 * @param key 键名
 * @param value 值
 * @param expire 过期时间（秒），不传则永久
 */
export const setStorage = <T>(key: string, value: T, expire?: number): void => {
  const data = {
    value,
    expire: expire ? Date.now() + expire * 1000 : null,
  };
  localStorage.setItem(getKey(key), JSON.stringify(data));
};

/**
 * 获取 localStorage
 * @param key 键名
 * @param defaultValue 默认值
 */
export const getStorage = <T>(key: string, defaultValue?: T): T | undefined => {
  const raw = localStorage.getItem(getKey(key));
  if (!raw) return defaultValue;

  try {
    const data = JSON.parse(raw);
    if (data.expire && Date.now() > data.expire) {
      removeStorage(key);
      return defaultValue;
    }
    return data.value as T;
  } catch {
    return defaultValue;
  }
};

/**
 * 移除 localStorage
 */
export const removeStorage = (key: string): void => {
  localStorage.removeItem(getKey(key));
};

/**
 * 清空所有带前缀的 localStorage
 */
export const clearStorage = (): void => {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => localStorage.removeItem(key));
};

/**
 * 设置 sessionStorage
 */
export const setSession = <T>(key: string, value: T): void => {
  sessionStorage.setItem(getKey(key), JSON.stringify(value));
};

/**
 * 获取 sessionStorage
 */
export const getSession = <T>(key: string, defaultValue?: T): T | undefined => {
  const raw = sessionStorage.getItem(getKey(key));
  if (!raw) return defaultValue;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * 移除 sessionStorage
 */
export const removeSession = (key: string): void => {
  sessionStorage.removeItem(getKey(key));
};

/**
 * 存储键名常量
 */
export const StorageKeys = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
  COLLAPSED: 'sidebar_collapsed',
  LOCALE: 'locale',
} as const;
