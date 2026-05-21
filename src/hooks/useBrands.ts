import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { brandService } from '../services/brandService'
import { BrandForm } from '../types/brand'

const KEY = 'brands'
export function useBrandList(search = '', page = 1, perPage = 15) {
  return useQuery({ queryKey: [KEY, search, page, perPage], queryFn: () => brandService.list({ search, page, perPage }) })
}
export function useBrand(uuid: string) {
  return useQuery({ queryKey: [KEY, uuid], queryFn: () => brandService.get(uuid), enabled: !!uuid })
}

export function useBrandViewDetails(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid, 'view-details'],
    queryFn: () => brandService.viewDetails(uuid),
    enabled: Boolean(uuid),
  })
}

export function useBrandPerformance(uuid: string, range: string, enabled = true) {
  return useQuery({
    queryKey: [KEY, uuid, 'performance', range],
    queryFn: () => brandService.performance(uuid, range),
    enabled: Boolean(uuid) && enabled,
  })
}
export function useCreateBrand() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (data: BrandForm) => brandService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useUpdateBrand() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ uuid, data }: { uuid: string; data: Partial<BrandForm> }) => brandService.update(uuid, data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useDeleteBrand() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (uuid: string) => brandService.delete(uuid), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useBrandStats(uuid: string, range: string) {
  return useQuery({ queryKey: [KEY, uuid, 'stats', range], queryFn: () => brandService.salesStats(uuid, range), enabled: !!uuid })
}
export function useBrandTopItems(uuid: string) {
  return useQuery({ queryKey: [KEY, uuid, 'top-items'], queryFn: () => brandService.topItems(uuid), enabled: !!uuid })
}
