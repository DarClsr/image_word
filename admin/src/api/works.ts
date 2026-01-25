import type { Work, WorkAudit, WorkBatchAudit } from '@/types/works';
import { get, post, put, del } from './request';

const BASE_URL = '/admin/works';

export const fetchWorks = (params?: Record<string, unknown>) => get<{ list: Work[]; total: number }>(BASE_URL, { params });

export const fetchWorkDetail = (id: number) => get<Work>(`${BASE_URL}/${id}`);

export const auditWork = (payload: WorkAudit) => put(`${BASE_URL}/${payload.id}/audit`, payload);

export const batchAuditWork = (payload: WorkBatchAudit) => post(`${BASE_URL}/batch-audit`, payload);

export const removeWork = (id: number) => del(`${BASE_URL}/${id}`);

export const batchRemoveWorks = (ids: number[]) => post(`${BASE_URL}/batch-delete`, { ids });
