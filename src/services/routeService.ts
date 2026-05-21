import api from '../lib/Axios'
import { Route, RouteForm, RouteOverview, RoutePerformance, RouteViewDetails } from '../types/route'

export interface RouteListResponse {
  routes: Route[]
  items: Route[]
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}

export const routeService = {
  list: (params: { page?: number; perPage?: number; search?: string } = {}): Promise<RouteListResponse> =>
    api.get('/admin/routes', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    }).then((r: any) => ({ ...r, items: r.routes || r.items })) as any,
  get: (uuid: string): Promise<{ item: Route }> =>
    (api.get(`/admin/routes/${uuid}`) as any).then((r: any) => ({ item: r.item ?? r.data })),
  create: (data: RouteForm): Promise<{ item: Route; message: string }> =>
    (api.post('/admin/routes', data) as any).then((r: any) => ({ item: r.item ?? r.data, message: r.message })),
  update: (uuid: string, data: Partial<RouteForm>): Promise<{ item: Route; message: string }> =>
    (api.put(`/admin/routes/${uuid}`, data) as any).then((r: any) => ({ item: r.item ?? r.data, message: r.message })),
  delete: (uuid: string): Promise<{ message: string }> => api.delete(`/admin/routes/${uuid}`) as any,
  viewDetails: (uuid: string): Promise<{ data: RouteViewDetails }> =>
    (api.get(`/admin/routes/${uuid}/view-details`) as any).then((r: any) => ({
      data: r.data ?? r,
    })),
  overview: (uuid: string): Promise<{ data: RouteOverview }> =>
    (api.get(`/admin/routes/${uuid}/overview`) as any).then((r: any) => ({
      data: r.data ?? r,
    })),
  performance: (uuid: string, range: string): Promise<{ data: RoutePerformance }> =>
    (api.get(`/admin/routes/${uuid}/performance`, { params: { range } }) as any).then((r: any) => ({
      data: r.data ?? r,
    })),
  topItems: (uuid: string): Promise<{ items: RouteViewDetails['topCustomers'] }> => api.get(`/admin/routes/${uuid}/top-items`) as any,
}
