export interface RouteForm {
  code: string
  name: string
  areaId: number | string
  areaName: string
  status: 0 | 1
}

export interface Route {
  id: number
  uuid: string
  code: string
  name: string
  areaId: number | string
  areaName: string
  status: 0 | 1
  organisationId?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface RouteOverview {
  totalLifetimeRevenue: number
  totalCustomers: number
  totalOrdersDelivered: number
}

export interface RouteTopCustomer {
  name: string
  orders: number
  revenue: number
}

export interface RouteViewDetails {
  route: Route
  overview: RouteOverview
  topCustomers: RouteTopCustomer[]
}

export interface RoutePerformanceChartPoint {
  label: string
  unitsSold: number
  revenue: number
  orderCount: number
}

export interface RoutePerformanceSummary {
  totalUnits: number
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
}

export interface RoutePerformance {
  routeUuid: string
  routeName: string
  routeCode: string
  range: 'day' | 'week' | 'month'
  rangeLabel: string
  summary: RoutePerformanceSummary
  chartData: RoutePerformanceChartPoint[]
}
