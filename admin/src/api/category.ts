import type { Category, CategoryCreate, CategoryUpdate } from '@/types/category';
import { get, post, put, del } from './request';

const BASE_URL = '/admin/category';

export const fetchCategories = () => get<Category[]>(BASE_URL);

export const createCategory = (payload: CategoryCreate) => post<Category>(BASE_URL, payload);

export const updateCategory = (payload: CategoryUpdate) =>
  put<Category>(`${BASE_URL}/${payload.id}`, payload);

export const removeCategory = (id: number) => del(`${BASE_URL}/${id}`);
