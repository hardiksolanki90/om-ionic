import api from '../lib/Axios'
import { Warehouse, WarehouseForm } from '../types/warehouse'

export interface WarehouseListResponse {
  warehouses: Warehouse[]
  items: Warehouse[]
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}

export const warehouseService = {
  list: (params: { page?: number; perPage?: number; search?: string } = {}): Promise<WarehouseListResponse> =>
    api.get('/admin/warehouses', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    }).then((r: any) => ({ ...r, items: r.warehouses })) as any,
  get: (uuid: string): Promise<{ success: boolean; data: Warehouse }> =>
    api.get(`/admin/warehouses/${uuid}`) as any,
  create: (data: WarehouseForm): Promise<{ item: Warehouse; message: string }> =>
    api.post('/admin/warehouses', data) as any,
  update: (uuid: string, data: Partial<WarehouseForm>): Promise<{ item: Warehouse; message: string }> =>
    api.put(`/admin/warehouses/${uuid}`, data) as any,
  delete: (uuid: string): Promise<{ message: string }> => api.delete(`/admin/warehouses/${uuid}`) as any,
}
