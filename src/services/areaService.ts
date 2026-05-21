import api from '../lib/Axios'
import { Area, AreaForm, AreaOverview, AreaPerformance, AreaViewDetails } from '../types/area'

export interface AreaListResponse {
  areas: Area[]
  items: Area[]
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}

export interface AreaParams {
  page?: number
  perPage?: number
  search?: string
  organisationId?: number | null
}

export const areaService = {
  list: (params: AreaParams = {}): Promise<AreaListResponse> =>
    api.get('/admin/areas', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 100,
        search: params.search || undefined,
        organisation_id: params.organisationId || undefined,
      },
    }).then((r: any) => ({ ...r, items: r.areas || r.items })) as any,

  get: (uuid: string): Promise<{ item: Area }> =>
    (api.get(`/admin/areas/${uuid}`) as any).then((r: any) => ({ item: r.item ?? r.data })),

  viewDetails: (uuid: string): Promise<{ data: AreaViewDetails }> =>
    (api.get(`/admin/areas/${uuid}/view-details`) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  overview: (uuid: string): Promise<{ data: AreaOverview }> =>
    (api.get(`/admin/areas/${uuid}/overview`) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  performance: (uuid: string, range: string): Promise<{ data: AreaPerformance }> =>
    (api.get(`/admin/areas/${uuid}/performance`, { params: { range } }) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  create: (data: AreaForm): Promise<{ item: Area; message: string }> =>
    api.post('/admin/areas', data) as any,

  update: (uuid: string, data: Partial<AreaForm>): Promise<{ item: Area; message: string }> =>
    api.put(`/admin/areas/${uuid}`, data) as any,

  delete: (uuid: string): Promise<{ message: string }> =>
    api.delete(`/admin/areas/${uuid}`) as any,
}
