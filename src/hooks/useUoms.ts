import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uomService } from '../services/uomService'
import { UomForm } from '../types/uom'

const KEY = 'uoms'
export function useUomList(search = '', page = 1, perPage = 15) {
  return useQuery({ queryKey: [KEY, search, page, perPage], queryFn: () => uomService.list({ search, page, perPage }) })
}
export function useUom(uuid: string | undefined) {
  return useQuery({ queryKey: [KEY, uuid], queryFn: () => uomService.get(uuid!), enabled: !!uuid })
}
export function useCreateUom() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (data: UomForm) => uomService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useUpdateUom() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ uuid, data }: { uuid: string; data: Partial<UomForm> }) => uomService.update(uuid, data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useDeleteUom() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (uuid: string) => uomService.delete(uuid), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
