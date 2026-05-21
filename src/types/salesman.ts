export interface SalesmanForm {
  firstName: string
  lastName: string
  code: string
  email: string
  username: string
  password?: string
  mobile: string
  salesmanType: string
  route: string
}

export interface Salesman {
  id: number
  uuid: string
  firstName: string
  lastName: string
  code: string
  email: string
  username: string
  mobile: string
  salesmanType: string
  route: string
  routeName?: string
  routeUuid?: string
  status: string | boolean
  organisationId?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface SalesmanOverview {
  totalLifetimeRevenue: number
  totalCustomers: number
  assignedCustomers: number
  totalOrdersDelivered: number
  routeUuid?: string | null
  routeName?: string | null
}

export interface SalesmanTopCustomer {
  uuid?: string
  name: string
  orders: number
  revenue: number
}

export interface SalesmanViewDetails {
  salesman: Salesman
  overview: SalesmanOverview
  topCustomers: SalesmanTopCustomer[]
}

export interface SalesmanPerformanceChartPoint {
  label: string
  unitsSold: number
  revenue: number
  orderCount: number
}

export interface SalesmanPerformanceSummary {
  totalUnits: number
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
}

export interface SalesmanPerformance {
  salesmanUuid: string
  salesmanName: string
  salesmanCode: string
  range: 'day' | 'week' | 'month'
  rangeLabel: string
  summary: SalesmanPerformanceSummary
  chartData: SalesmanPerformanceChartPoint[]
}
