import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { dashboardService, DashboardParams } from '../services/dashboardService'

export function useDashboard(params: DashboardParams | undefined) {
  const enabled = Boolean(params?.start_date && params?.end_date)

  return useQuery({
    queryKey: ['dashboard', params?.start_date, params?.end_date],
    queryFn: () => dashboardService.get(params!),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  })
}
