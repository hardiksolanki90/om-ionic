import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Pencil,
  BarChart2,
  User,
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  Route as RouteIcon,
  Calendar,
  Hash,
  Mail,
  Phone,
  AtSign,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageLayout } from '../../layouts/PageLayout'
import { ItemSalesChart } from '../items/ItemCharts'
import { useSalesmanViewDetails, useSalesmanPerformance } from '../../hooks/useSalesman'

function isSalesmanActive(status: string | boolean | number | undefined): boolean {
  if (typeof status === 'boolean') {
    return status
  }
  if (typeof status === 'number') {
    return status === 1
  }
  return status === 'active' || status === '1'
}

function formatStatus(status: string | boolean | number | undefined): string {
  return isSalesmanActive(status) ? 'Active' : 'Inactive'
}

type TabId = 'details' | 'performance'
type RangeId = 'day' | 'week' | 'month'
type MetricId = 'unitsSold' | 'revenue'

const STAT_CARD_ICON_CLASS: Record<string, string> = {
  sky: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
}

export default function SalesmanView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabId>('details')
  const [range, setRange] = useState<RangeId>('week')
  const [metric, setMetric] = useState<MetricId>('unitsSold')

  const { data: viewData, isLoading, isError, refetch: refetchDetails } = useSalesmanViewDetails(id ?? '')
  const performanceEnabled = activeTab === 'performance'
  const {
    data: performanceData,
    isLoading: performanceLoading,
    isError: performanceError,
    refetch: refetchPerformance,
  } = useSalesmanPerformance(id ?? '', range, performanceEnabled && Boolean(id))

  const salesman = viewData?.data?.salesman
  const overview = viewData?.data?.overview
  const performance = performanceData?.data
  const chartData = performance?.chartData ?? []
  const topCustomers = viewData?.data?.topCustomers ?? []

  const displayName = salesman
    ? `${salesman.firstName ?? ''} ${salesman.lastName ?? ''}`.trim() || salesman.code
    : ''

  const summary = {
    totalUnits: performance?.summary?.totalUnits ?? 0,
    totalRevenue: performance?.summary?.totalRevenue ?? 0,
    totalOrders: performance?.summary?.totalOrders ?? 0,
  }

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
  }, [])

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: 'Details', icon: <User className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <BarChart2 className="w-4 h-4" /> },
  ]

  const field = (label: string, value: React.ReactNode, icon: React.ReactNode) => (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{value || '—'}</div>
      </div>
    </div>
  )

  if (!id) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-slate-500">Invalid salesman link.</p>
          <Button variant="outline" onClick={() => navigate('/salesman')}>
            Back to Salesmen
          </Button>
        </div>
      </PageLayout>
    )
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Loading salesman details...</p>
        </div>
      </PageLayout>
    )
  }

  if (isError || !salesman?.uuid) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-slate-500">Salesman not found or failed to load.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchDetails()}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => navigate('/salesman')}>
              Back to Salesmen
            </Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  const routeLabel = overview?.routeName ?? salesman.routeName ?? '—'
  const routeUuid = overview?.routeUuid ?? salesman.routeUuid

  return (
    <PageLayout>
      <div className="flex flex-col">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/salesman')}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-brand-100 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-800/60 flex items-center justify-center flex-shrink-0 text-lg font-semibold text-brand-600">
                {salesman.firstName?.[0]}
                {salesman.lastName?.[0] ?? ''}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{displayName}</h1>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{salesman.code}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant={salesman.salesmanType === 'Salesman' ? 'info' : 'warning'}>
                    {salesman.salesmanType}
                  </Badge>
                  <Badge variant={isSalesmanActive(salesman.status) ? 'success' : 'neutral'}>
                    {formatStatus(salesman.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => navigate(`/salesman/edit/${salesman.uuid}`)}
          >
            Edit
          </Button>
        </div>

        <div className="mb-6" role="tablist" aria-label="Salesman sections">
          <div className="inline-flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div role="tabpanel" hidden={activeTab !== 'details'} className={activeTab !== 'details' ? 'hidden' : ''}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">About</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {salesman.salesmanType} covering {overview?.assignedCustomers ?? 0} assigned customers
                  {routeLabel !== '—' ? ` on route ${routeLabel}` : ''}.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {field('Salesman Code', salesman.code, <Hash className="w-4 h-4" />)}
                  {field('Username', salesman.username, <AtSign className="w-4 h-4" />)}
                  {field('Email', salesman.email, <Mail className="w-4 h-4" />)}
                  {field('Mobile', salesman.mobile, <Phone className="w-4 h-4" />)}
                  {field(
                    'Assigned Route',
                    routeUuid ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/routes/view/${routeUuid}`)}
                        className="text-brand-600 hover:underline text-left"
                      >
                        {routeLabel}
                      </button>
                    ) : (
                      routeLabel
                    ),
                    <RouteIcon className="w-4 h-4" />
                  )}
                  {field('Status', formatStatus(salesman.status), <User className="w-4 h-4" />)}
                  {salesman.createdAt &&
                    field(
                      'Created',
                      new Date(salesman.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }),
                      <Calendar className="w-4 h-4" />
                    )}
                  {salesman.updatedAt &&
                    field(
                      'Last Updated',
                      new Date(salesman.updatedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }),
                      <Calendar className="w-4 h-4" />
                    )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" /> Top Customers
                </h3>
                {topCustomers.length > 0 ? (
                  <div className="space-y-3">
                    {topCustomers.map((customer, idx) => (
                      <button
                        key={customer.uuid ?? `customer-${idx}`}
                        type="button"
                        onClick={() => customer.uuid && navigate(`/customers/view/${customer.uuid}`)}
                        disabled={!customer.uuid}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/40 hover:border-brand-300 dark:hover:border-brand-700 transition-colors text-left disabled:opacity-70 disabled:hover:border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {customer.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            ${Number(customer.revenue).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">{customer.orders} orders</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No customer sales data yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-brand-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/20">
                <p className="text-brand-100 text-xs font-bold uppercase tracking-widest mb-1">
                  Total Lifetime Revenue
                </p>
                <p className="text-4xl font-bold">
                  $
                  {Number(overview?.totalLifetimeRevenue ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <div className="mt-4 pt-4 border-t border-brand-500/30 space-y-3">
                  <div>
                    <p className="text-brand-100 text-xs">Total Customers</p>
                    <p className="text-xl font-bold mt-0.5">{overview?.totalCustomers ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-brand-100 text-xs">Assigned Customers</p>
                    <p className="text-xl font-bold mt-0.5">{overview?.assignedCustomers ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${STAT_CARD_ICON_CLASS.sky}`}>
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Orders Delivered</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {overview?.totalOrdersDelivered ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${STAT_CARD_ICON_CLASS.violet}`}>
                    <RouteIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Route</p>
                    {routeUuid ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/routes/view/${routeUuid}`)}
                        className="text-xl font-bold text-brand-600 hover:underline text-left"
                      >
                        {routeLabel}
                      </button>
                    ) : (
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{routeLabel}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          role="tabpanel"
          hidden={activeTab !== 'performance'}
          className={activeTab !== 'performance' ? 'hidden' : 'space-y-6 pb-6'}
        >
          {performanceError && (
            <div className="flex flex-col items-center justify-center h-48 gap-3 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
              <p className="text-red-600 dark:text-red-400 text-sm">Failed to load performance data.</p>
              <Button variant="outline" onClick={() => refetchPerformance()}>
                Retry
              </Button>
            </div>
          )}

          {!performanceError && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Units Sold',
                    value: performanceLoading ? '…' : summary.totalUnits,
                    icon: <Package className="w-5 h-5" />,
                    color: 'sky',
                  },
                  {
                    label: 'Revenue',
                    value: performanceLoading
                      ? '…'
                      : `$${summary.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                    icon: <DollarSign className="w-5 h-5" />,
                    color: 'emerald',
                  },
                  {
                    label: 'Orders',
                    value: performanceLoading ? '…' : summary.totalOrders,
                    icon: <ShoppingCart className="w-5 h-5" />,
                    color: 'violet',
                  },
                ].map(s => (
                  <div
                    key={s.label}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-5 flex items-center gap-4"
                  >
                    <div className={`p-3 rounded-xl ${STAT_CARD_ICON_CLASS[s.color]}`}>{s.icon}</div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Sales Performance</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {displayName} ·{' '}
                      {performance?.rangeLabel ??
                        (range === 'day' ? 'Today' : range === 'week' ? 'This Week' : 'This Month')}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      {(['unitsSold', 'revenue'] as MetricId[]).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMetric(m)}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${
                            metric === m
                              ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm'
                              : 'text-slate-500'
                          }`}
                        >
                          {m === 'unitsSold' ? 'Units' : 'Revenue'}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      {(['day', 'week', 'month'] as RangeId[]).map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRange(r)}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${
                            range === r
                              ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm'
                              : 'text-slate-500'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 relative min-h-[280px]">
                  {performanceLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 z-10">
                      <p className="text-slate-500 text-sm">Loading performance data...</p>
                    </div>
                  )}
                  <ItemSalesChart data={chartData} metric={metric} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
