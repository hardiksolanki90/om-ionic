import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routeService } from '../services/routeService'
import { RouteForm } from '../types/route'

const KEY = 'routes'
export function useRouteList(search = '', page = 1, perPage = 15) {
  return useQuery({ queryKey: [KEY, search, page, perPage], queryFn: () => routeService.list({ search, page, perPage }) })
}
export function useRoute(uuid: string) {
  return useQuery({ queryKey: [KEY, uuid], queryFn: () => routeService.get(uuid), enabled: !!uuid })
}
export function useCreateRoute() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (data: RouteForm) => routeService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useUpdateRoute() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ uuid, data }: { uuid: string; data: Partial<RouteForm> }) => routeService.update(uuid, data), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useDeleteRoute() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (uuid: string) => routeService.delete(uuid), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) })
}
export function useRouteTopItems(uuid: string) {
  return useQuery({ queryKey: [KEY, uuid, 'top-items'], queryFn: () => routeService.topItems(uuid), enabled: !!uuid })
}
export function useRouteViewDetails(uuid: string) {
  return useQuery({ queryKey: [KEY, uuid, 'view-details'], queryFn: () => routeService.viewDetails(uuid), enabled: !!uuid })
}
export function useRouteOverview(uuid: string) {
  return useQuery({ queryKey: [KEY, uuid, 'overview'], queryFn: () => routeService.overview(uuid), enabled: !!uuid })
}
export function useRoutePerformance(uuid: string, range: string, enabled = true) {
  return useQuery({
    queryKey: [KEY, uuid, 'performance', range],
    queryFn: () => routeService.performance(uuid, range),
    enabled: !!uuid && enabled,
  })
}
