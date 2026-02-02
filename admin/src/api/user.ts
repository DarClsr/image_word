import type {
  User,
  UserQuotaUpdate,
  UserMemberUpdate,
} from '@/types/user';
import { get, put } from './request';

const BASE_URL = '/admin/user';

export const fetchUsers = (params?: Record<string, unknown>) => get<{ list: User[]; total: number }>(BASE_URL, { params });

export const fetchUserDetail = (id: number) => get<User>(`${BASE_URL}/${id}`);

export const updateUserQuota = (id: number, payload: Omit<UserQuotaUpdate, 'id'>) =>
  put(`${BASE_URL}/${id}/quota`, payload);

export const banUser = (id: number, reason?: string) =>
  put(`${BASE_URL}/${id}/ban`, { reason });

export const unbanUser = (id: number) =>
  put(`${BASE_URL}/${id}/unban`, {});

export const updateUserMember = (id: number, payload: Omit<UserMemberUpdate, 'id'>) =>
  put(`${BASE_URL}/${id}/member`, payload);

export const fetchUserWorks = (id: number, params?: Record<string, unknown>) =>
  get(`${BASE_URL}/${id}/works`, { params });
