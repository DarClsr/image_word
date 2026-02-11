import type { Category, CategoryCreate, CategoryUpdate } from '@/types/category';
import { get, post, put, del } from './request';

const BASE_URL = '/admin/category';

export const fetchCategories = (params?: {
  type?: 'style' | 'model';
  status?: 0 | 1;
  parentId?: number;
  keyword?: string;
}) => get<Category[]>(BASE_URL, { params });

export const createCategory = (payload: CategoryCreate) => post<Category>(BASE_URL, payload);

export const updateCategory = (payload: CategoryUpdate) =>
  put<Category>(`${BASE_URL}/${payload.id}`, payload);

export const removeCategory = (id: number) => del(`${BASE_URL}/${id}`);

export const updateCategorySort = (items: Array<{ id: number; sort: number }>) =>
  put(`${BASE_URL}/sort`, { items });

export const updateCategoryStatus = (id: number) =>
  put(`${BASE_URL}/${id}/status`);
