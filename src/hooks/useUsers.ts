import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'
import { UserForm } from '../types/user'

export function useUserList(search?: string, page: number = 1, perPage: number = 20) {
  return useQuery({
    queryKey: ['users', search, page, perPage],
    queryFn: () => userService.list({ search, page, perPage }),
  })
}

export function useUser(uuid: string | undefined) {
  return useQuery({
    queryKey: ['users', uuid],
    queryFn: () => userService.get(uuid!),
    enabled: !!uuid,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UserForm) => userService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Partial<UserForm> }) => userService.update(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', variables.uuid] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => userService.delete(uuid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}
