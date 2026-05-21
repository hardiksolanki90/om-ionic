import api from '../lib/Axios'

export interface DashboardStats {
  totalOrders: number
  todayOrders: number
  totalCustomers: number
  totalItems: number
  totalReturns: number
}

export interface ChartPoint {
  label: string
  value: number
}

export interface LowStockItem {
  code: string
  name: string
  stock: number
}

export interface DashboardData {
  stats: DashboardStats
  dailySales: ChartPoint[]
  aovTrend: ChartPoint[]
  lowStock: LowStockItem[]
}

export interface DashboardParams {
  start_date?: string
  end_date?: string
}

export const dashboardService = {
  get: (params?: DashboardParams): Promise<DashboardData> =>
    api.get('/admin/dashboard', { params }) as any,
}
