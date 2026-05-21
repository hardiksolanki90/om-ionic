import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { returnService } from '../services/returnService'
import { ReturnForm } from '../types/return'

const KEY = 'returns'

export function useReturnList(search = '', page = 1, perPage = 20) {
  return useQuery({
    queryKey: [KEY, search, page, perPage],
    queryFn: () => returnService.list({ search, page, perPage }),
  })
}

export function useReturn(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid],
    queryFn: () => returnService.get(uuid),
    enabled: !!uuid,
  })
}

export function useCreateReturn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReturnForm) => returnService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateReturn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Partial<ReturnForm> }) => returnService.update(uuid, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeleteReturn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => returnService.delete(uuid),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
