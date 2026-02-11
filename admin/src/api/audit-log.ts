import { get, type PageResponse } from './request';

export interface AuditLogItem {
  id: number;
  adminId: number;
  action: string;
  module: string;
  targetId: number | null;
  targetType?: string | null;
  ip: string;
  userAgent?: string | null;
  createdAt: string;
  admin?: {
    id: number;
    username: string;
    realName?: string | null;
    role: string;
  };
}

export interface AuditLogQuery {
  page?: number;
  pageSize?: number;
  module?: string;
  action?: string;
  adminId?: number;
  targetId?: number;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export const fetchAuditLogs = (params: AuditLogQuery) =>
  get<PageResponse<AuditLogItem>>('/admin/audit-log', { params });
