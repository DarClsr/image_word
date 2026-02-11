import { get, put } from './request';

export interface SystemConfig {
  siteName: string;
  logo: string;
  freeQuotaDaily: number;
  basicQuotaDaily: number;
  proQuotaDaily: number;
  autoAudit: boolean;
  sensitiveFilter: boolean;
}

export interface RatioConfig {
  id: number;
  label: string;
  width: number;
  height: number;
  sort: number;
  status: 0 | 1;
}

export interface CountConfig {
  id: number;
  value: number;
  label: string;
  multiplier: number;
  sort: number;
  status: 0 | 1;
}

export interface GenerationDefaults {
  styleId?: number;
  modelId: number;
  ratioIndex: number;
  countIndex: number;
}

export interface GenerationConfig {
  ratios: RatioConfig[];
  counts: CountConfig[];
  defaults: GenerationDefaults | null;
  maxSize: number;
}

const BASE_URL = '/admin/system';

export const fetchSystemConfig = () => get<SystemConfig>(`${BASE_URL}/config`);
export const updateSystemConfig = (payload: Partial<SystemConfig>) =>
  put<SystemConfig>(`${BASE_URL}/config`, payload);

export const fetchGenerationConfig = () => get<GenerationConfig>(`${BASE_URL}/generation`);
export const updateGenerationConfig = (payload: Partial<GenerationConfig>) =>
  put<GenerationConfig>(`${BASE_URL}/generation`, payload);
