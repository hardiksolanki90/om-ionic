import api from '../lib/Axios'
import type { ReportTableRow } from '../types/reporting'

export interface ReportFilters {
  dateFrom?: string
  dateTo?: string
  search?: string
  salesmanId?: number
  customerId?: number
  warehouseId?: number
  categoryId?: number
  brandId?: number
  threshold?: number
  page?: number
  perPage?: number
}

export interface ReportResponse {
  data: ReportTableRow[]
  total: number
  currentPage: number
  lastPage: number
  perPage: number
}

export const reportingService = {
  fetch: async (slug: string, filters: ReportFilters = {}): Promise<ReportResponse> => {
    const params: Record<string, string | number> = {
      page: filters.page ?? 1,
      per_page: filters.perPage ?? 25,
    }

    if (filters.dateFrom)    params.date_from    = filters.dateFrom
    if (filters.dateTo)      params.date_to      = filters.dateTo
    if (filters.search)      params.search       = filters.search
    if (filters.salesmanId)  params.salesman_id  = filters.salesmanId
    if (filters.customerId)  params.customer_id  = filters.customerId
    if (filters.warehouseId) params.warehouse_id = filters.warehouseId
    if (filters.categoryId)  params.category_id  = filters.categoryId
    if (filters.brandId)     params.brand_id     = filters.brandId
    if (filters.threshold != null) params.threshold = filters.threshold

    const res: any = await api.get(`/admin/reports/${slug}`, { params })

    return {
      data:        res.data   ?? res.items ?? [],
      total:       res.total  ?? res.meta?.total ?? 0,
      currentPage: res.current_page ?? res.meta?.current_page ?? 1,
      lastPage:    res.last_page    ?? res.meta?.last_page    ?? 1,
      perPage:     res.per_page     ?? res.meta?.per_page     ?? 25,
    }
  },
}
