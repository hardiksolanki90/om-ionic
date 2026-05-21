export interface Customer {
  id: number
  uuid: string
  customerCode: string
  shopName: string
  firstName: string
  lastName: string
  address: string
  mobile: string
  idSalesman: number | string
  salesmanName?: string
  salesmanUuid?: string
  status: 0 | 1 | boolean
  createdAt?: string
  updatedAt?: string
}

export interface CustomerFormData {
  customerCode: string
  shopName: string
  firstName: string
  lastName: string
  address: string
  mobile: string
  idSalesman: number | string
  status: 0 | 1
}

export interface CustomerOverview {
  totalLifetimeRevenue: number
  totalOrders: number
  avgOrderValue: number
  successfulOrders: number
  pendingReturns: number
  completionRate: number
  lastOrderAt: string | null
}

export interface CustomerViewDetails {
  customer: Customer
  overview: CustomerOverview
}

export interface CustomerPerformanceChartPoint {
  label: string
  unitsSold: number
  revenue: number
  orderCount: number
}

export interface CustomerPerformanceSummary {
  totalUnits: number
  totalRevenue: number
  totalOrders: number
}

export interface CustomerPerformance {
  customerUuid: string
  customerName: string
  customerCode: string
  range: 'day' | 'week' | 'month'
  rangeLabel: string
  summary: CustomerPerformanceSummary
  chartData: CustomerPerformanceChartPoint[]
}
