export interface BrandForm {
  name: string
  code: string
  status: string
}

export interface Brand {
  id: number
  uuid: string
  name: string
  code: string
  status: string | boolean | number
  organisationId?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface BrandOverview {
  totalLifetimeRevenue: number
  totalOrders: number
  avgOrderValue: number
  totalItems: number
  activeItems: number
}

export interface BrandTopItem {
  uuid: string
  code: string
  name: string
  orders: number
  unitsSold: number
  revenue: number
}

export interface BrandViewDetails {
  brand: Brand
  overview: BrandOverview
  topItems: BrandTopItem[]
}

export interface BrandPerformanceChartPoint {
  label: string
  unitsSold: number
  revenue: number
  orderCount: number
}

export interface BrandPerformanceSummary {
  totalUnits: number
  totalRevenue: number
  totalOrders: number
  totalItems?: number
}

export interface BrandPerformance {
  brandUuid: string
  brandName: string
  brandCode: string
  range: 'day' | 'week' | 'month'
  rangeLabel: string
  summary: BrandPerformanceSummary
  chartData: BrandPerformanceChartPoint[]
}
