export interface CategoryForm {
  name: string
  code: string
  tax: string
  status: boolean
}

export function isCategoryActive(status: string | boolean | number | undefined): boolean {
  if (typeof status === 'boolean') {
    return status
  }
  if (typeof status === 'number') {
    return status === 1
  }
  return status === 'active' || status === '1'
}

export interface Category {
  id: number
  uuid: string
  name: string
  code: string
  tax: string
  status: string | boolean | number
  organisationId?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface CategoryOverview {
  totalLifetimeRevenue: number
  totalOrders: number
  avgOrderValue: number
  totalItems: number
  activeItems: number
  tax?: string | number | null
}

export interface CategoryTopItem {
  uuid: string
  code: string
  name: string
  orders: number
  unitsSold: number
  revenue: number
}

export interface CategoryViewDetails {
  category: Category
  overview: CategoryOverview
  topItems: CategoryTopItem[]
}

export interface CategoryPerformanceChartPoint {
  label: string
  unitsSold: number
  revenue: number
  orderCount: number
}

export interface CategoryPerformanceSummary {
  totalUnits: number
  totalRevenue: number
  totalOrders: number
  totalItems?: number
}

export interface CategoryPerformance {
  categoryUuid: string
  categoryName: string
  categoryCode: string
  range: 'day' | 'week' | 'month'
  rangeLabel: string
  summary: CategoryPerformanceSummary
  chartData: CategoryPerformanceChartPoint[]
}
