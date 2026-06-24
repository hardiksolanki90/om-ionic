import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deliveryService } from '../services/deliveryService'
import { DeliveryForm } from '../types/delivery'

const KEY = 'deliveries'

export function useDeliveryList(search = '') {
  return useQuery({
    queryKey: [KEY, search],
    queryFn: () => deliveryService.list({ search })
  })
}

export function useDelivery(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid],
    queryFn: () => deliveryService.get(uuid),
    enabled: !!uuid
  })
}

export function useCreateDelivery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DeliveryForm) => deliveryService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  })
}

export function useUpdateDelivery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Partial<DeliveryForm> }) => deliveryService.update(uuid, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  })
}

export function useDeleteDelivery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => deliveryService.delete(uuid),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  })
}
