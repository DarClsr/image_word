import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

const defaultConfig: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 20000,
  withCredentials: true,
};

const request: AxiosInstance = axios.create(defaultConfig);

request.interceptors.request.use((config) => {
  // TODO: inject auth token from store when available
  return config;
});

request.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    // TODO: hook global error handler / notification
    return Promise.reject(error);
  }
);

export { request };

export const get = <T = unknown>(url: string, config?: AxiosRequestConfig) =>
  request.get<T>(url, config);

export const post = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request.post<T>(url, data, config);

export const put = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request.put<T>(url, data, config);

export const del = <T = unknown>(url: string, config?: AxiosRequestConfig) =>
  request.delete<T>(url, config);
