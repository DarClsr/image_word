import { post } from './request';

const BASE_URL = '/admin/auth';

/**
 * 管理员信息
 */
export interface AdminInfo {
  id: number;
  username: string;
  realName: string | null;
  role: string;
  permissions: string[];
}

/**
 * 登录响应
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  admin: AdminInfo;
}

/**
 * 登录参数
 */
export interface LoginParams {
  username: string;
  password: string;
}

/**
 * 管理员登录
 */
export const login = (params: LoginParams) =>
  post<LoginResponse>(`${BASE_URL}/login`, params);

/**
 * 刷新 Token
 */
export const refreshToken = (refreshToken: string) =>
  post<LoginResponse>(`${BASE_URL}/refresh`, { refreshToken });

/**
 * 登出
 */
export const logout = () => post<{ success: boolean }>(`${BASE_URL}/logout`);
