import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesmanService } from '../services/salesmanService'
import { SalesmanForm } from '../types/salesman'

const KEY = 'salesman'
export function useSalesmanList(search = '', page = 1, perPage = 15) {
  return useQuery({ queryKey: [KEY, search, page, perPage], queryFn: () => salesmanService.list({ search, page, perPage }) })
}
export function useSalesman(uuid: string | undefined) {
  return useQuery({ queryKey: [KEY, uuid], queryFn: () => salesmanService.get(uuid!), enabled: !!uuid })
}

export function useSalesmanViewDetails(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid, 'view-details'],
    queryFn: () => salesmanService.viewDetails(uuid),
    enabled: Boolean(uuid),
  })
}

export function useSalesmanPerformance(uuid: string, range: string, enabled = true) {
  return useQuery({
    queryKey: [KEY, uuid, 'performance', range],
    queryFn: () => salesmanService.performance(uuid, range),
    enabled: Boolean(uuid) && enabled,
  })
}
export function useCreateSalesman() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (data: SalesmanForm) => salesmanService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useUpdateSalesman() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ uuid, data }: { uuid: string; data: Partial<SalesmanForm> }) => salesmanService.update(uuid, data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useDeleteSalesman() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (uuid: string) => salesmanService.delete(uuid), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
