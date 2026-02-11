import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';
import { useAuthStore } from '@/store/modules/auth';
import { StorageKeys, getStorage, removeStorage } from '@/utils/storage';

/**
 * API 响应结构
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页响应结构
 */
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 错误码定义
 */
export const ErrorCodes = {
  SUCCESS: 0,
  UNKNOWN_ERROR: 1000,
  VALIDATION_ERROR: 1001,
  NOT_FOUND: 1002,
  FORBIDDEN: 1003,
  UNAUTHORIZED: 2000,
  TOKEN_EXPIRED: 2001,
  TOKEN_INVALID: 2002,
  LOGIN_FAILED: 2003,
} as const;

/**
 * 错误消息映射
 */
const ErrorMessages: Record<number, string> = {
  [ErrorCodes.UNKNOWN_ERROR]: '未知错误，请稍后重试',
  [ErrorCodes.VALIDATION_ERROR]: '参数验证失败',
  [ErrorCodes.NOT_FOUND]: '资源不存在',
  [ErrorCodes.FORBIDDEN]: '没有操作权限',
  [ErrorCodes.UNAUTHORIZED]: '请先登录',
  [ErrorCodes.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCodes.TOKEN_INVALID]: '登录凭证无效',
  [ErrorCodes.LOGIN_FAILED]: '登录失败',
};

/** 消息提示函数（由外部注入） */
let messageHandler: {
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
} | null = null;

/**
 * 设置消息处理器
 */
export const setMessageHandler = (handler: typeof messageHandler) => {
  messageHandler = handler;
};

/**
 * Axios 默认配置
 */
const defaultConfig: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * 创建 Axios 实例
 */
const instance: AxiosInstance = axios.create(defaultConfig);

/**
 * 请求拦截器
 */
instance.interceptors.request.use(
  (config) => {
    // 注入 Token
    const token = getStorage<string>(StorageKeys.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加时间戳防止缓存
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;

    // 业务错误处理
    if (data.code !== ErrorCodes.SUCCESS) {
      const message = data.message || ErrorMessages[data.code] || '请求失败';

      // Token 相关错误，跳转登录
      const tokenErrorCodes = [ErrorCodes.UNAUTHORIZED, ErrorCodes.TOKEN_EXPIRED, ErrorCodes.TOKEN_INVALID];
      if (tokenErrorCodes.includes(data.code as 2000 | 2001 | 2002)) {
        handleUnauthorized();
      }

      messageHandler?.error(message);
      return Promise.reject(new Error(message));
    }

    return data.data as unknown as AxiosResponse;
  },
  (error: AxiosError<ApiResponse>) => {
    let message = '网络错误，请稍后重试';

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          message = '登录已过期，请重新登录';
          handleUnauthorized();
          break;
        case 403:
          message = '没有操作权限';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器错误，请稍后重试';
          break;
        default:
          message = data?.message || `请求失败 (${status})`;
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请检查网络';
    } else if (!navigator.onLine) {
      message = '网络连接已断开';
    }

    messageHandler?.error(message);
    return Promise.reject(error);
  }
);

/**
 * 处理未授权（Token 失效）
 */
const handleUnauthorized = () => {
  const authStore = useAuthStore();
  authStore.reset();
  removeStorage(StorageKeys.TOKEN);
  removeStorage(StorageKeys.REFRESH_TOKEN);
  removeStorage(StorageKeys.USER_INFO);

  // 跳转登录页
  const currentPath = window.location.pathname;
  if (!currentPath.includes('/login')) {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
};

/**
 * 封装请求方法
 */
export const request = instance;

export const get = <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  instance.get(url, config);

export const post = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  instance.post(url, data, config);

export const put = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  instance.put(url, data, config);

export const patch = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  instance.patch(url, data, config);

export const del = <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  instance.delete(url, config);

export const del = <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  instance.delete(url, config);

/**
 * 上传文件
 */
export const upload = <T = unknown>(
  url: string,
  file: File,
  onProgress?: (percent: number) => void,
  config?: AxiosRequestConfig
): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);

  return instance.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onProgress?.(percent);
      }
    },
  });
};

/**
 * 下载文件
 */
export const download = async (url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> => {
  const response = await instance.get(url, {
    ...config,
    responseType: 'blob',
  });

  const blob = new Blob([response as unknown as BlobPart]);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || `download_${Date.now()}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
