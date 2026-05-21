import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '../services/categoryService'
import { CategoryForm } from '../types/category'

const KEY = 'categories'
export function useCategoryList(search = '', page = 1, perPage = 20) {
  return useQuery({ 
    queryKey: [KEY, search, page, perPage], 
    queryFn: () => categoryService.list({ search, page, perPage }) 
  })
}
export function useCategory(uuid: string) {
  return useQuery({ queryKey: [KEY, uuid], queryFn: () => categoryService.get(uuid), enabled: !!uuid })
}

export function useCategoryViewDetails(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid, 'view-details'],
    queryFn: () => categoryService.viewDetails(uuid),
    enabled: Boolean(uuid),
  })
}

export function useCategoryPerformance(uuid: string, range: string, enabled = true) {
  return useQuery({
    queryKey: [KEY, uuid, 'performance', range],
    queryFn: () => categoryService.performance(uuid, range),
    enabled: Boolean(uuid) && enabled,
  })
}
export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (data: CategoryForm) => categoryService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ uuid, data }: { uuid: string; data: Partial<CategoryForm> }) => categoryService.update(uuid, data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (uuid: string) => categoryService.delete(uuid), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useCategoryStats(uuid: string, range: string) {
  return useQuery({ queryKey: [KEY, uuid, 'stats', range], queryFn: () => categoryService.salesStats(uuid, range), enabled: !!uuid })
}
export function useCategoryTopItems(uuid: string) {
  return useQuery({ queryKey: [KEY, uuid, 'top-items'], queryFn: () => categoryService.topItems(uuid), enabled: !!uuid })
}
