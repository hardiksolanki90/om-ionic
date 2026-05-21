import api from '../lib/Axios'
import { Role, RoleForm } from '../types/role'

export interface RoleListResponse {
  roles: Role[]
  items: Role[]
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}

export const roleService = {
  list: (params: { page?: number; perPage?: number; search?: string } = {}): Promise<RoleListResponse> =>
    api.get('/admin/roles', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    }).then((r: any) => ({ ...r, items: r.roles })) as any,
  get: (uuid: string): Promise<{ item: Role }> =>
    api.get(`/admin/roles/${uuid}`) as any,
  create: (data: RoleForm): Promise<{ item: Role; message: string }> =>
    api.post('/admin/roles', data) as any,
  update: (uuid: string, data: Partial<RoleForm>): Promise<{ item: Role; message: string }> =>
    api.put(`/admin/roles/${uuid}`, data) as any,
  delete: (uuid: string): Promise<{ message: string }> => api.delete(`/admin/roles/${uuid}`) as any,
}
