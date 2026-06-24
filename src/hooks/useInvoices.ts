import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceService } from '../services/invoiceService'
import { InvoiceForm } from '../types/invoice'

const KEY = 'invoices'

export function useInvoiceList(search = '') {
  return useQuery({
    queryKey: [KEY, search],
    queryFn: () => invoiceService.list({ search })
  })
}

export function useInvoice(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid],
    queryFn: () => invoiceService.get(uuid),
    enabled: !!uuid
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: InvoiceForm) => invoiceService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  })
}

export function useUpdateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Partial<InvoiceForm> }) => invoiceService.update(uuid, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  })
}

export function useDeleteInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => invoiceService.delete(uuid),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  })
}