import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleService } from '../services/roleService'
import { RoleForm } from '../types/role'

export function useRoleList(search?: string, page: number = 1, perPage: number = 20) {
  return useQuery({
    queryKey: ['roles', search, page, perPage],
    queryFn: () => roleService.list({ search, page, perPage }),
  })
}

export function useRole(uuid: string | undefined) {
  return useQuery({
    queryKey: ['roles', uuid],
    queryFn: () => roleService.get(uuid!),
    enabled: !!uuid,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleForm) => roleService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Partial<RoleForm> }) => roleService.update(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['roles', variables.uuid] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => roleService.delete(uuid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}
