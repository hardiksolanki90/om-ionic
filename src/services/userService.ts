import api from '../lib/Axios'
import { User, UserForm } from '../types/user'

export interface UserListResponse {
  users: User[]
  items: User[]
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}

export const userService = {
  list: (params: { page?: number; perPage?: number; search?: string } = {}): Promise<UserListResponse> =>
    api.get('/admin/users', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    }).then((r: any) => ({ ...r, items: r.users })) as any,
  get: (uuid: string): Promise<{ item: User }> =>
    api.get(`/admin/users/${uuid}`) as any,
  create: (data: UserForm): Promise<{ item: User; message: string }> =>
    api.post('/admin/users', data) as any,
  update: (uuid: string, data: Partial<UserForm>): Promise<{ item: User; message: string }> =>
    api.put(`/admin/users/${uuid}`, data) as any,
  delete: (uuid: string): Promise<{ message: string }> => api.delete(`/admin/users/${uuid}`) as any,
}
