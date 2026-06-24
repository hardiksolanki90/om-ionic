import { useQuery } from '@tanstack/react-query'
import { reportingService, type ReportFilters } from '../services/reportingService'

const KEY = 'reports'

export function useReport(slug: string, filters: ReportFilters) {
  return useQuery({
    queryKey: [KEY, slug, filters],
    queryFn: () => reportingService.fetch(slug, filters),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  })
}
