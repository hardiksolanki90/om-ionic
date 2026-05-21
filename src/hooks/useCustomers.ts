import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerService } from '../services/customerService'
import { CustomerFormData } from '../types/customer'

const KEY = 'customers'
const INFINITE_PER_PAGE = 20

export function useCustomerList(search = '', page = 1, perPage = 15) {
  return useQuery({ queryKey: [KEY, search, page, perPage], queryFn: () => customerService.list({ search, page, perPage }) })
}

export function useCustomerListInfinite(search = '') {
  return useInfiniteQuery({
    queryKey: [KEY, 'infinite', search],
    queryFn: ({ pageParam = 1 }) =>
      customerService.list({ page: pageParam as number, perPage: INFINITE_PER_PAGE, search }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
  })
}
export function useCustomer(uuid: string) {
  return useQuery({ queryKey: [KEY, uuid], queryFn: () => customerService.get(uuid), enabled: !!uuid })
}

export function useCustomerViewDetails(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid, 'view-details'],
    queryFn: () => customerService.viewDetails(uuid),
    enabled: Boolean(uuid),
  })
}

export function useCustomerPerformance(uuid: string, range: string, enabled = true) {
  return useQuery({
    queryKey: [KEY, uuid, 'performance', range],
    queryFn: () => customerService.performance(uuid, range),
    enabled: Boolean(uuid) && enabled,
  })
}
export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (data: CustomerFormData) => customerService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ uuid, data }: { uuid: string; data: Partial<CustomerFormData> }) => customerService.update(uuid, data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (uuid: string) => customerService.delete(uuid), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
