import api from '../lib/Axios'
import { Uom, UomForm } from '../types/uom'

export interface UomListResponse {
  uoms: Uom[]
  items: Uom[]
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}

export const uomService = {
  list: (params: { page?: number; perPage?: number; search?: string } = {}): Promise<UomListResponse> =>
    api.get('/admin/uoms', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    }).then((r: any) => ({ ...r, items: r.uoms || r.items })) as any,
  get: (uuid: string): Promise<{ item: Uom }> => api.get(`/admin/uoms/${uuid}`) as any,
  create: (data: UomForm): Promise<{ item: Uom; message: string }> =>
    (api.post('/admin/uoms', data) as any).then((r: any) => ({ item: r.item ?? r.data, message: r.message })),
  update: (uuid: string, data: Partial<UomForm>): Promise<{ item: Uom; message: string }> =>
    (api.put(`/admin/uoms/${uuid}`, data) as any).then((r: any) => ({ item: r.item ?? r.data, message: r.message })),
  delete: (uuid: string): Promise<{ message: string }> => api.delete(`/admin/uoms/${uuid}`) as any,
}
