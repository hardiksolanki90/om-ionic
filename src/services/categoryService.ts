import api from '../lib/Axios'
import {
  Category,
  CategoryForm,
  CategoryOverview,
  CategoryPerformance,
  CategoryViewDetails,
} from '../types/category'

export interface CategoryListPagination {
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}
export interface CategoryListResponse {
  categories: Category[]
  items: Category[]
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}

export const categoryService = {
  list: (params: { page?: number; perPage?: number; search?: string } = {}): Promise<CategoryListResponse> =>
    api.get('/admin/categories', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    }).then((r: any) => ({ ...r, items: r.categories || r.items })) as any,

  get: (uuid: string): Promise<{ item: Category }> =>
    (api.get(`/admin/categories/${uuid}`) as any).then((r: any) => ({
      item: r.item ?? r.data,
    })),

  viewDetails: (uuid: string): Promise<{ data: CategoryViewDetails }> =>
    (api.get(`/admin/categories/${uuid}/view-details`) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  overview: (uuid: string): Promise<{ data: CategoryOverview }> =>
    (api.get(`/admin/categories/${uuid}/overview`) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  performance: (uuid: string, range: string): Promise<{ data: CategoryPerformance }> =>
    (api.get(`/admin/categories/${uuid}/performance`, { params: { range } }) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  create: (data: CategoryForm): Promise<{ item: Category; message: string }> =>
    (api.post('/admin/categories', data) as any).then((r: any) => ({ item: r.item ?? r.data, message: r.message })),

  update: (uuid: string, data: Partial<CategoryForm>): Promise<{ item: Category; message: string }> =>
    (api.put(`/admin/categories/${uuid}`, data) as any).then((r: any) => ({ item: r.item ?? r.data, message: r.message })),

  delete: (uuid: string): Promise<{ message: string }> => api.delete(`/admin/categories/${uuid}`) as any,

  salesStats: (uuid: string, range: string): Promise<any> =>
    api.get(`/admin/categories/${uuid}/sales-stats`, { params: { range } }) as any,

  topItems: (uuid: string): Promise<any> => api.get(`/admin/categories/${uuid}/top-items`) as any,
}
