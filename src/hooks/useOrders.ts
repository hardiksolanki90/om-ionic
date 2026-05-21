import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../services/orderService'
import { OrderForm } from '../types/order'

const KEY = 'orders'

export function useOrderList(search = '') {
  return useQuery({
    queryKey: [KEY, search],
    queryFn: () => orderService.list({ search })
  })
}

export function useOrder(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid],
    queryFn: () => orderService.get(uuid),
    enabled: !!uuid
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OrderForm) => orderService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  })
}

export function useUpdateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Partial<OrderForm> }) => orderService.update(uuid, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  })
}

export function useDeleteOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => orderService.delete(uuid),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  })
}
