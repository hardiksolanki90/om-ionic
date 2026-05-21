import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateCodePreviews } from './useCodeSetting'
import { areaService } from '../services/areaService'
import { AreaForm } from '../types/area'

const KEY = 'areas'

export function useAreaList(search = '', page = 1, perPage = 15) {
  return useQuery({
    queryKey: [KEY, search, page, perPage],
    queryFn: () => areaService.list({ search, page, perPage }),
  })
}

export function useArea(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid],
    queryFn: () => areaService.get(uuid),
    enabled: Boolean(uuid),
  })
}

export function useAreaViewDetails(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid, 'view-details'],
    queryFn: () => areaService.viewDetails(uuid),
    enabled: Boolean(uuid),
  })
}

export function useAreaOverview(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid, 'overview'],
    queryFn: () => areaService.overview(uuid),
    enabled: Boolean(uuid),
  })
}

export function useAreaPerformance(uuid: string, range: string, enabled = true) {
  return useQuery({
    queryKey: [KEY, uuid, 'performance', range],
    queryFn: () => areaService.performance(uuid, range),
    enabled: Boolean(uuid) && enabled,
  })
}

export function useCreateArea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AreaForm) => areaService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      invalidateCodePreviews(qc)
    },
  })
}

export function useUpdateArea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Partial<AreaForm> }) =>
      areaService.update(uuid, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeleteArea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => areaService.delete(uuid),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
