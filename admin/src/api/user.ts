import type {
  User,
  UserMemberUpdate,
  UserQuotaUpdate,
  UserStatusUpdate,
} from '@/types/user';
import { get, put } from './request';

const BASE_URL = '/admin/user';

export const fetchUsers = (params?: Record<string, unknown>) => get<{ list: User[]; total: number }>(BASE_URL, { params });

export const fetchUserDetail = (id: number) => get<User>(`${BASE_URL}/${id}`);

export const updateUserStatus = (payload: UserStatusUpdate) => put(`${BASE_URL}/${payload.id}/status`, payload);

export const updateUserQuota = (payload: UserQuotaUpdate) => put(`${BASE_URL}/${payload.id}/quota`, payload);

export const updateUserMember = (payload: UserMemberUpdate) => put(`${BASE_URL}/${payload.id}/member`, payload);

export const fetchUserWorks = (id: number, params?: Record<string, unknown>) =>
  get(`${BASE_URL}/${id}/works`, { params });
