export interface AreaForm {
  code: string
  name: string
  status: boolean
}

export function isAreaActive(status: string | boolean | number | undefined): boolean {
  if (typeof status === 'boolean') {
    return status
  }
  if (typeof status === 'number') {
    return status === 1
  }
  return status === 'active' || status === '1'
}

export interface Area {
  id: number
  uuid: string
  code: string
  name: string
  status: string | boolean
  organisationId?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface AreaOverview {
  totalLifetimeRevenue: number
  totalCustomers: number
  totalOrdersDelivered: number
  totalRoutes: number
  activeRoutes: number
}

export interface AreaTopRoute {
  uuid: string
  name: string
  code: string
  orders: number
  revenue: number
}

export interface AreaTopCustomer {
  name: string
  orders: number
  revenue: number
}

export interface AreaViewDetails {
  area: Area
  overview: AreaOverview
  topRoutes: AreaTopRoute[]
  topCustomers: AreaTopCustomer[]
}

export interface AreaPerformanceChartPoint {
  label: string
  unitsSold: number
  revenue: number
  orderCount: number
}

export interface AreaPerformanceSummary {
  totalUnits: number
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
}

export interface AreaPerformance {
  areaUuid: string
  areaName: string
  areaCode: string
  range: 'day' | 'week' | 'month'
  rangeLabel: string
  summary: AreaPerformanceSummary
  chartData: AreaPerformanceChartPoint[]
}
