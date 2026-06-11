import api from '../lib/Axios'

export interface DashboardStats {
  totalOrders: number
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

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function normalizeChartPoints(raw: unknown): ChartPoint[] {
  if (!Array.isArray(raw)) {
    return []
  }

  return raw
    .map((row) => {
      const point = row as Record<string, unknown>
      const label = String(point.label ?? '')
      const value = toNumber(point.value)

      if (!label) {
        return null
      }

      return { label, value }
    })
    .filter((row): row is ChartPoint => row !== null)
}

/** Supports flat body or `{ data: { ... } }` envelope from older APIs. */
export function normalizeDashboardResponse(body: unknown): DashboardData {
  const root = body as Record<string, unknown>
  const payload =
    root.stats !== undefined || root.dailySales !== undefined
      ? root
      : ((root.data as Record<string, unknown> | undefined) ?? root)

  const statsRaw = (payload.stats as Record<string, unknown> | undefined) ?? {}

  return {
    stats: {
      totalOrders: toNumber(statsRaw.totalOrders ?? statsRaw.total_orders),
      totalCustomers: toNumber(statsRaw.totalCustomers ?? statsRaw.total_customers),
      totalItems: toNumber(statsRaw.totalItems ?? statsRaw.total_items),
      totalReturns: toNumber(statsRaw.totalReturns ?? statsRaw.total_returns),
    },
    dailySales: normalizeChartPoints(payload.dailySales ?? payload.daily_sales),
    aovTrend: normalizeChartPoints(payload.aovTrend ?? payload.aov_trend),
    lowStock: Array.isArray(payload.lowStock ?? payload.low_stock)
      ? ((payload.lowStock ?? payload.low_stock) as LowStockItem[])
      : [],
  }
}

export const dashboardService = {
  get: async (params: DashboardParams): Promise<DashboardData> => {
    const body = await api.get('/admin/dashboard', { params })
    return normalizeDashboardResponse(body)
  },
}
