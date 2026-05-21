import api from '../lib/Axios'
import {
  Customer,
  CustomerFormData,
  CustomerOverview,
  CustomerPerformance,
  CustomerViewDetails,
} from '../types/customer'

export interface CustomerListResponse {
  customers: Customer[]
  items: Customer[]
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}

const map = (c: any): Customer => ({
  ...c,
  customerCode: c.code ?? c.customerCode ?? '',
})

export const customerService = {
  list: (params: { page?: number; perPage?: number; search?: string } = {}): Promise<CustomerListResponse> =>
    api.get('/admin/customers', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    }).then((r: any) => ({ ...r, items: r.customers })) as any,

  get: (uuid: string): Promise<{ item: Customer }> =>
    (api.get(`/admin/customers/${uuid}`) as any).then((r: any) => ({
      item: map(r.item ?? r.data),
    })),

  viewDetails: (uuid: string): Promise<{ data: CustomerViewDetails }> =>
    (api.get(`/admin/customers/${uuid}/view-details`) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  overview: (uuid: string): Promise<{ data: CustomerOverview }> =>
    (api.get(`/admin/customers/${uuid}/overview`) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  performance: (uuid: string, range: string): Promise<{ data: CustomerPerformance }> =>
    (api.get(`/admin/customers/${uuid}/performance`, { params: { range } }) as any).then((r: any) => ({
      data: r.data ?? r,
    })),

  create: (data: CustomerFormData): Promise<{ item: Customer; message: string }> =>
    api.post('/admin/customers', { ...data, code: data.customerCode }) as any,

  update: (uuid: string, data: Partial<CustomerFormData>): Promise<{ item: Customer; message: string }> =>
    api.put(`/admin/customers/${uuid}`, { ...data, code: data.customerCode }) as any,

  delete: (uuid: string): Promise<{ message: string }> => api.delete(`/admin/customers/${uuid}`) as any,
}
