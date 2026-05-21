import api from '../lib/Axios'
import { Return, ReturnForm } from '../types/return'

export interface ReturnListResponse {
  items: Return[]
  total: number
  currentPage: number
  lastPage: number
}

export const returnService = {
  list: async (params: { page?: number; perPage?: number; search?: string } = {}): Promise<ReturnListResponse> => {
    const res: any = await api.get('/admin/returns', {
      params: { page: params.page ?? 1, per_page: params.perPage ?? 20, search: params.search || undefined },
    })
    return { ...res, items: (res.returns || res.items || []) }
  },
  get: async (uuid: string): Promise<{ data: Return }> => {
    const res: any = await api.get(`/admin/returns/${uuid}`)
    return { data: res.data || res.item || res }
  },
  create: async (data: ReturnForm): Promise<{ item: Return; message: string }> =>
    api.post('/admin/returns', data) as any,
  update: async (uuid: string, data: Partial<ReturnForm>): Promise<{ item: Return; message: string }> =>
    api.put(`/admin/returns/${uuid}`, data) as any,
  delete: async (uuid: string): Promise<{ message: string }> =>
    api.delete(`/admin/returns/${uuid}`) as any,
}
