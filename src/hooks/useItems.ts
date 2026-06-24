import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemService } from '../services/itemService'
import { ItemForm } from '../types/item'

const KEY = 'items'
const INFINITE_PER_PAGE = 20

export function useItemList(search = '', page = 1, perPage = 15) {
  return useQuery({
    queryKey: [KEY, search, page, perPage],
    queryFn: () => itemService.list({ search, page, perPage }),
  })
}

export function useItemListInfinite(search = '', enabled = true) {
  return useInfiniteQuery({
    queryKey: [KEY, 'infinite', search],
    queryFn: ({ pageParam = 1 }) =>
      itemService.list({ page: pageParam as number, perPage: INFINITE_PER_PAGE, search }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
    enabled,
  })
}

export function useItem(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid],
    queryFn: () => itemService.get(uuid),
    enabled: !!uuid,
  })
}

export function useCreateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ItemForm) => itemService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Partial<ItemForm> }) =>
      itemService.update(uuid, data),
    onSuccess: (_result, { uuid }) => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: [KEY, uuid] })
    },
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => itemService.delete(uuid),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useItemStats(uuid: string, range: string, enabled = true) {
  return useQuery({
    queryKey: [KEY, uuid, 'stats', range],
    queryFn: () => itemService.salesStats(uuid, range),
    enabled: Boolean(uuid) && enabled,
  })
}

export function useItemStockLevels(uuid: string, enabled = true) {
  return useQuery({
    queryKey: [KEY, uuid, 'stock-levels'],
    queryFn: () => itemService.stockLevels(uuid),
    enabled: Boolean(uuid) && enabled,
  })
}
