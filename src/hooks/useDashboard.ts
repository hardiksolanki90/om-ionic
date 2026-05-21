import { useQuery } from '@tanstack/react-query'
import { dashboardService, DashboardParams } from '../services/dashboardService'

export function useDashboard(params?: DashboardParams) {
  return useQuery({
    queryKey: ['dashboard', params?.start_date, params?.end_date],
    queryFn: () => dashboardService.get(params),
    staleTime: 2 * 60 * 1000, // 2 min
    enabled: true,
  })
}
