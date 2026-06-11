import { useState, useMemo } from 'react'
import { ShoppingCart, Users, Package, RotateCcw, TrendingUp, TrendingDown, AlertTriangle, TrendingUp as BestSellerIcon, Inbox, CalendarRange, X } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { PageLayout } from '../../layouts/PageLayout'
import { RouteBarChart, DailyLineChart, AovAreaChart } from './DashboardCharts'
import { cn } from '../../lib/cn'
import { useDashboard } from '../../hooks/useDashboard'
import { ChartPoint } from '../../services/dashboardService'

const tableHeader = "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-700/60"

const MAX_DAYS = 90

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDefaultDates() {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  start.setDate(start.getDate() - 6) // default last 7 days
  return { start: formatDate(start), end: formatDate(end) }
}

export default function Dashboard() {
  const defaults = useMemo(() => getDefaultDates(), [])
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)

  // Compute today's date string for max attribute
  const todayStr = useMemo(() => formatDate(new Date()), [])

  // Compute max allowed start (endDate - 0, but range can't exceed 90 days)
  // Compute min allowed end (startDate)
  // Compute max allowed end = min(today, startDate + 89 days)
  const maxEndDate = useMemo(() => {
    if (!startDate) return todayStr
    const [y, m, d] = startDate.split('-').map(Number)
    const start = new Date(y, m - 1, d)
    const maxFromStart = new Date(start)
    maxFromStart.setDate(maxFromStart.getDate() + MAX_DAYS - 1)

    const [ty, tm, td] = todayStr.split('-').map(Number)
    const today = new Date(ty, tm - 1, td)

    return formatDate(maxFromStart < today ? maxFromStart : today)
  }, [startDate, todayStr])

  const minStartDate = useMemo(() => {
    if (!endDate) return undefined
    const [y, m, d] = endDate.split('-').map(Number)
    const end = new Date(y, m - 1, d)
    const minFromEnd = new Date(end)
    minFromEnd.setDate(minFromEnd.getDate() - (MAX_DAYS - 1))
    return formatDate(minFromEnd)
  }, [endDate])

  // Validation
  const rangeError = useMemo(() => {
    if (!startDate || !endDate) return null
    const [sy, sm, sd] = startDate.split('-').map(Number)
    const [ey, em, ed] = endDate.split('-').map(Number)
    const start = new Date(sy, sm - 1, sd)
    const end = new Date(ey, em - 1, ed)

    if (end < start) return 'End date must be after start date.'
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    if (diffDays > MAX_DAYS) return `Date range cannot exceed ${MAX_DAYS} days. Currently selected: ${diffDays} days.`
    return null
  }, [startDate, endDate])

  const isValidRange = !rangeError && !!startDate && !!endDate

  const { data, isPending, isError, error } = useDashboard(
    isValidRange ? { start_date: startDate, end_date: endDate } : undefined,
  )

  const showStatsSkeleton = isPending && data === undefined

  const handleStartDateChange = (val: string) => {
    setStartDate(val)
    // If new start makes end exceed 90 days, clamp end
    if (val && endDate) {
      const [sy, sm, sd] = val.split('-').map(Number)
      const [ey, em, ed] = endDate.split('-').map(Number)
      const start = new Date(sy, sm - 1, sd)
      const end = new Date(ey, em - 1, ed)

      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      if (diffDays > MAX_DAYS) {
        const newEnd = new Date(start)
        newEnd.setDate(newEnd.getDate() + MAX_DAYS - 1)
        const today = new Date()
        setEndDate(formatDate(newEnd < today ? newEnd : today))
      }
    }
  }

  const handleReset = () => {
    setStartDate(defaults.start)
    setEndDate(defaults.end)
  }

  const formatStat = (value: number | undefined) =>
    value === undefined ? '—' : new Intl.NumberFormat().format(value)

  const statCards = [
    { label: 'Total Orders', value: formatStat(data?.stats.totalOrders), icon: <ShoppingCart className="w-5 h-5" />, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/30', up: true },
    { label: 'Customers', value: formatStat(data?.stats.totalCustomers), icon: <Users className="w-5 h-5" />, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/30', up: true },
    { label: 'Items in Catalog', value: formatStat(data?.stats.totalItems), icon: <Package className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30', up: true },
    { label: 'Returns', value: formatStat(data?.stats.totalReturns), icon: <RotateCcw className="w-5 h-5" />, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/30', up: false },
  ]

  const routeSales: ChartPoint[] = [] // Not yet provided by backend
  const dailySales = data?.dailySales ?? []
  const aovTrend = data?.aovTrend ?? []
  const lowStock = data?.lowStock ?? []

  return (
    <PageLayout>
      <div className="space-y-6">

        {/* Compact Date Range Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
              <CalendarRange className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Dashboard</h2>
              {isValidRange && !rangeError && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {startDate} to {endDate} · <span className="font-medium text-brand-600 dark:text-brand-400">{Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Filters */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2">
              {[
                { label: '7D', days: 7 },
                { label: '30D', days: 30 },
                { label: '90D', days: 90 },
              ].map((opt) => {
                const start = new Date()
                start.setDate(start.getDate() - (opt.days - 1))
                const startStr = formatDate(start)
                const endStr = formatDate(new Date())
                const isActive = startDate === startStr && endDate === endStr

                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setStartDate(startStr)
                      setEndDate(endStr)
                    }}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-md transition-all",
                      isActive
                        ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                max={endDate || todayStr}
                min={minStartDate}
                onChange={e => handleStartDateChange(e.target.value)}
                className={cn(
                  'h-8 w-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-[12px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500',
                  rangeError && 'border-red-400 focus:ring-red-400'
                )}
              />
              <span className="text-slate-400 text-xs">→</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={maxEndDate}
                onChange={e => setEndDate(e.target.value)}
                className={cn(
                  'h-8 w-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-[12px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500',
                  rangeError && 'border-red-400 focus:ring-red-400'
                )}
              />
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center justify-center"
              title="Reset"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {rangeError && (
          <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            {rangeError}
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Failed to load dashboard data. {(error as Error)?.message ?? 'Please try again.'}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map(stat => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
                  {showStatsSkeleton ? (
                    <span className="inline-block w-16 h-7 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
                  ) : (
                    stat.value
                  )}
                </p>
                {stat.label === 'Total Orders' && isValidRange && !showStatsSkeleton && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    {startDate} → {endDate}
                  </p>
                )}
                <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-slate-400 font-normal">Selected period</span>
                </div>
              </div>
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Primary Row: Route Sales & Daily Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Route-wise Sales</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sales performance by route</p>
            </div>
            <div className="flex-1 pb-4">
              <RouteBarChart data={routeSales} />
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-500 rounded-sm" />
                <span className="text-xs font-medium text-slate-600">Total Sales</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Sales</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sales trend for selected period</p>
            </div>
            <div className="flex-1 pb-4">
              <DailyLineChart data={dailySales} />
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-emerald-500 rounded-full relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-emerald-500 bg-white" />
                </div>
                <span className="text-xs font-medium text-slate-600">Total Sales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width: AOV Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Average Order Value</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Customer spending pattern for selected period</p>
          </div>
          <div className="flex-1 pb-4">
            <AovAreaChart data={aovTrend} />
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-violet-500 rounded-full relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-violet-500 bg-white" />
              </div>
              <span className="text-xs font-medium text-slate-600">Avg Order Value</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Low Stock & Best Seller */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Low Stock Items</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Items requiring attention</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <th className={tableHeader}>Item Code</th>
                    <th className={tableHeader}>Item Name</th>
                    <th className={cn(tableHeader, "text-right")}>Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                  {lowStock.map(item => (
                    <tr key={item.code} className="hover:bg-slate-25 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-3.5 text-xs font-mono text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">{item.code}</td>
                      <td className="px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400">{item.name}</td>
                      <td className="px-6 py-3.5 text-right">
                        <Badge variant={item.stock === 0 ? 'danger' : 'warning'} className="font-mono text-[10px] w-8 h-8 flex items-center justify-center rounded-lg">
                          {item.stock}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Best Seller Products</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Top performing items in selected period</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
                <BestSellerIcon className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-60">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 relative">
                <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">No sales data for selected period</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
