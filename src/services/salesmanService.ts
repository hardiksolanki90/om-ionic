import api from '../lib/Axios'
import {
  Salesman,
  SalesmanForm,
  SalesmanOverview,
  SalesmanPerformance,
  SalesmanTopCustomer,
  SalesmanViewDetails,
} from '../types/salesman'

export interface SalesmanListResponse {
  salesman: Salesman[]
  items: Salesman[]
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}

function unwrapResource<T>(value: unknown): T {
  if (
    value &&
    typeof value === 'object' &&
    'data' in value &&
    (value as { data?: unknown }).data &&
    typeof (value as { data?: unknown }).data === 'object'
  ) {
    return (value as { data: T }).data
  }

  return value as T
}

const map = (s: Record<string, unknown>): Salesman => {
  const mapped = { ...s, route: String(s.idRoute ?? s.route ?? '') } as unknown as Salesman

  return mapped
}

function parseViewDetailsResponse(response: Record<string, unknown>): { data: SalesmanViewDetails } {
  const payload = (response.data ?? response) as Record<string, unknown>
  const salesman = map(unwrapResource<Record<string, unknown>>(payload.salesman))
  const overview = (payload.overview ?? {}) as SalesmanOverview
  const topCustomers = Array.isArray(payload.topCustomers)
    ? (payload.topCustomers as SalesmanTopCustomer[])
    : []

  return {
    data: {
      salesman,
      overview,
      topCustomers,
    },
  }
}

export const salesmanService = {
  list: (params: { page?: number; perPage?: number; search?: string } = {}): Promise<SalesmanListResponse> =>
    api.get('/admin/salesman', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    }).then((r: any) => ({ ...r, items: r.salesman || r.items })) as any,

  get: (uuid: string): Promise<{ item: Salesman }> =>
    (api.get(`/admin/salesman/${uuid}`) as Promise<Record<string, unknown>>).then(r => ({
      item: map(unwrapResource<Record<string, unknown>>(r.item ?? r.data)),
    })),

  viewDetails: (uuid: string): Promise<{ data: SalesmanViewDetails }> =>
    (api.get(`/admin/salesman/${uuid}/view-details`) as Promise<Record<string, unknown>>).then(
      parseViewDetailsResponse
    ),

  overview: (uuid: string): Promise<{ data: SalesmanOverview }> =>
    (api.get(`/admin/salesman/${uuid}/overview`) as Promise<Record<string, unknown>>).then(r => ({
      data: (r.data ?? r) as SalesmanOverview,
    })),

  performance: (uuid: string, range: string): Promise<{ data: SalesmanPerformance }> =>
    (
      api.get(`/admin/salesman/${uuid}/performance`, { params: { range } }) as Promise<
        Record<string, unknown>
      >
    ).then(r => ({
      data: (r.data ?? r) as SalesmanPerformance,
    })),

  create: (data: SalesmanForm): Promise<{ item: Salesman; message: string }> =>
    (api.post('/admin/salesman', { ...data, code: data.code, idRoute: data.route }) as any).then(
      (r: any) => ({
        item: map(unwrapResource<Record<string, unknown>>(r.item ?? r.data)),
        message: r.message,
      })
    ),

  update: (uuid: string, data: Partial<SalesmanForm>): Promise<{ item: Salesman; message: string }> =>
    (api.put(`/admin/salesman/${uuid}`, { ...data, code: data.code, idRoute: data.route }) as any).then(
      (r: any) => ({
        item: map(unwrapResource<Record<string, unknown>>(r.item ?? r.data)),
        message: r.message,
      })
    ),

  delete: (uuid: string): Promise<{ message: string }> => api.delete(`/admin/salesman/${uuid}`) as any,
}
