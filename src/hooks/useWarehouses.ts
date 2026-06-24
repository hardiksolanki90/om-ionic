import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { warehouseService } from '../services/warehouseService'
import { WarehouseForm } from '../types/warehouse'

export function useWarehouseList(search?: string, page: number = 1, perPage: number = 20) {
  return useQuery({
    queryKey: ['warehouses', search, page, perPage],
    queryFn: () => warehouseService.list({ search, page, perPage }),
  })
}

export function useWarehouseListInfinite(search?: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ['warehouses', 'infinite', search],
    queryFn: ({ pageParam = 1 }) => warehouseService.list({ search, page: pageParam, perPage: 20 }),
    getNextPageParam: (lastPage: any) => lastPage.currentPage < lastPage.lastPage ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
    enabled,
  })
}

export function useWarehouse(uuid: string | undefined) {
  return useQuery({
    queryKey: ['warehouses', uuid],
    queryFn: () => warehouseService.get(uuid!),
    enabled: !!uuid,
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WarehouseForm) => warehouseService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Partial<WarehouseForm> }) => warehouseService.update(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      queryClient.invalidateQueries({ queryKey: ['warehouses', variables.uuid] })
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => warehouseService.delete(uuid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  })
}
