import api from '../lib/Axios'
import { Brand, BrandForm, BrandOverview, BrandPerformance, BrandViewDetails } from '../types/brand'

export interface BrandListResponse {
  brands: Brand[]
  items: Brand[]
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}

export const brandService = {
  list: (params: { page?: number; perPage?: number; search?: string } = {}): Promise<BrandListResponse> =>
    api.get('/admin/brands', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    }).then((r: any) => ({ ...r, items: r.brands || r.items })) as any,

  get: (uuid: string): Promise<{ item: Brand }> =>
    (api.get(`/admin/brands/${uuid}`) as any).then((r: any) => ({
      item: r.item ?? r.data,
    })),

  viewDetails: (uuid: string): Promise<{ data: BrandViewDetails }> =>
    (api.get(`/admin/brands/${uuid}/view-details`) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  overview: (uuid: string): Promise<{ data: BrandOverview }> =>
    (api.get(`/admin/brands/${uuid}/overview`) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  performance: (uuid: string, range: string): Promise<{ data: BrandPerformance }> =>
    (api.get(`/admin/brands/${uuid}/performance`, { params: { range } }) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  create: (data: BrandForm): Promise<{ item: Brand; message: string }> =>
    (api.post('/admin/brands', data) as any).then((r: any) => ({ item: r.item ?? r.data, message: r.message })),

  update: (uuid: string, data: Partial<BrandForm>): Promise<{ item: Brand; message: string }> =>
    (api.put(`/admin/brands/${uuid}`, data) as any).then((r: any) => ({ item: r.item ?? r.data, message: r.message })),

  delete: (uuid: string): Promise<{ message: string }> => api.delete(`/admin/brands/${uuid}`) as any,

  salesStats: (uuid: string, range: string): Promise<any> =>
    api.get(`/admin/brands/${uuid}/sales-stats`, { params: { range } }) as any,

  topItems: (uuid: string): Promise<any> => api.get(`/admin/brands/${uuid}/top-items`) as any,
}
