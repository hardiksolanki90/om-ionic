import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  User,
  History,
  ChevronLeft,
  Pencil,
  Phone,
  MapPin,
  UserCircle,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  X,
  Package,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageLayout } from '../../layouts/PageLayout'
import { CustomerOrderChart } from './CustomerCharts'
import { useCustomerViewDetails, useCustomerPerformance } from '../../hooks/useCustomers'
import type { Customer } from '../../types/customer'

function isCustomerActive(status: Customer['status'] | undefined): boolean {
  if (typeof status === 'boolean') {
    return status
  }
  return status === 1
}

function formatLastOrder(lastOrderAt: string | null | undefined): { relative: string; absolute: string } {
  if (!lastOrderAt) {
    return { relative: 'No orders yet', absolute: '—' }
  }
  const date = new Date(lastOrderAt)
  const absolute = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  let relative: string
  if (diffDays <= 0) {
    relative = 'Today'
  } else if (diffDays === 1) {
    relative = '1 day ago'
  } else {
    relative = `${diffDays} days ago`
  }
  return { relative, absolute }
}

type TabId = 'details' | 'history'
type RangeId = 'day' | 'week' | 'month'
type MetricId = 'orderCount' | 'revenue'

export default function CustomerView() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('details')
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(() => new Set(['details']))
  const [timeRange, setTimeRange] = useState<RangeId>('week')
  const [metric, setMetric] = useState<MetricId>('orderCount')

  const { data: viewData, isLoading, isError } = useCustomerViewDetails(uuid!)
  const performanceEnabled = visitedTabs.has('history')
  const {
    data: performanceData,
    isLoading: performanceLoading,
    isError: performanceError,
    refetch: refetchPerformance,
  } = useCustomerPerformance(uuid!, timeRange, performanceEnabled)

  const customer = viewData?.data?.customer
  const overview = viewData?.data?.overview
  const performance = performanceData?.data
  const chartData = performance?.chartData ?? []
  const lastOrder = formatLastOrder(overview?.lastOrderAt)

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
    setVisitedTabs(prev => new Set(prev).add(tab))
  }, [])

  const field = (label: string, value: React.ReactNode, icon: React.ReactNode) => (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{value ?? '—'}</div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Loading customer details...</p>
        </div>
      </PageLayout>
    )
  }

  if (isError || !customer) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
          <p>Customer not found or failed to load.</p>
          <Button variant="outline" onClick={() => navigate('/customers')}>
            Back to List
          </Button>
        </div>
      </PageLayout>
    )
  }

  const createdAtLabel = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'

  return (
    <PageLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{customer.shopName}</h1>
                <Badge variant={isCustomerActive(customer.status) ? 'success' : 'neutral'}>
                  {isCustomerActive(customer.status) ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-mono mt-0.5">{customer.customerCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={<Pencil className="w-4 h-4" />}
              onClick={() => navigate(`/customers/edit/${customer.uuid}`)}
            >
              Edit Profile
            </Button>
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="inline-flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => handleTabChange('details')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'details'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <User className="w-4 h-4" />
              Details
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <History className="w-4 h-4" />
              Order History
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Contact &amp; Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {field(
                      'Contact Person',
                      `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim(),
                      <UserCircle className="w-5 h-5" />
                    )}
                    {field('Phone Number', customer.mobile, <Phone className="w-5 h-5" />)}
                    <div className="md:col-span-2">
                      {field('Business Address', customer.address, <MapPin className="w-5 h-5" />)}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Relationship Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {field(
                      'Assigned Salesman',
                      customer.salesmanUuid ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/salesman/view/${customer.salesmanUuid}`)}
                          className="text-brand-600 hover:underline text-left text-sm font-medium"
                        >
                          {customer.salesmanName || 'View salesman'}
                        </button>
                      ) : (
                        customer.salesmanName || 'Unassigned'
                      ),
                      <UserCircle className="w-5 h-5" />
                    )}
                    {field('Registration Date', createdAtLabel, <Calendar className="w-5 h-5" />)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-brand-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/20">
                  <p className="text-brand-100 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    $
                    {Number(overview?.totalLifetimeRevenue ?? 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="mt-4 pt-4 border-t border-brand-500/30 flex items-center justify-between">
                    <span className="text-brand-100 text-xs">Avg. Order Value</span>
                    <span className="text-lg font-bold">
                      ${Number(overview?.avgOrderValue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Lifetime Orders</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{overview?.totalOrders ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Completion Rate</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {overview?.completionRate ?? 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-6">
              {performanceLoading && (
                <div className="flex items-center justify-center h-48 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900">
                  <p className="text-slate-500 text-sm">Loading order history...</p>
                </div>
              )}

              {performanceError && !performanceLoading && (
                <div className="flex flex-col items-center justify-center h-48 gap-3 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
                  <p className="text-red-600 dark:text-red-400 text-sm">Failed to load order history.</p>
                  <Button variant="outline" onClick={() => refetchPerformance()}>
                    Retry
                  </Button>
                </div>
              )}

              {!performanceLoading && !performanceError && (
                <>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sales Performance</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {customer.shopName} ·{' '}
                          {performance?.rangeLabel ??
                            (timeRange === 'day' ? 'Today' : timeRange === 'week' ? 'This Week' : 'This Month')}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          {(['orderCount', 'revenue'] as MetricId[]).map(m => (
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
                              {m === 'orderCount' ? 'Orders' : 'Revenue'}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          {(['day', 'week', 'month'] as RangeId[]).map(range => (
                            <button
                              key={range}
                              type="button"
                              onClick={() => setTimeRange(range)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                                timeRange === range
                                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <CustomerOrderChart data={chartData} metric={metric} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
                      <p className="text-xs text-slate-500 font-medium mb-1">Successful Orders</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {overview?.successfulOrders ?? 0}
                      </p>
                      <div className="mt-2 text-[10px] text-emerald-600 font-bold">
                        {overview?.completionRate ?? 0}% completion rate
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
                      <p className="text-xs text-slate-500 font-medium mb-1">Pending Returns</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {overview?.pendingReturns ?? 0}
                      </p>
                      <div className="mt-2 text-[10px] text-amber-600 font-bold">
                        {(overview?.pendingReturns ?? 0) > 0 ? 'Requires attention' : 'All clear'}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
                      <p className="text-xs text-slate-500 font-medium mb-1">Last Order</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{lastOrder.relative}</p>
                      <div className="mt-2 text-[10px] text-slate-400 font-bold">{lastOrder.absolute}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        label: 'Period Orders',
                        value: performance?.summary?.totalOrders ?? 0,
                        icon: <ShoppingCart className="w-5 h-5" />,
                        color: 'sky',
                      },
                      {
                        label: 'Period Revenue',
                        value: `$${(performance?.summary?.totalRevenue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                        icon: <DollarSign className="w-5 h-5" />,
                        color: 'emerald',
                      },
                      {
                        label: 'Units Sold',
                        value: performance?.summary?.totalUnits ?? 0,
                        icon: <Package className="w-5 h-5" />,
                        color: 'violet',
                      },
                    ].map(s => (
                      <div
                        key={s.label}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-5 flex items-center gap-4"
                      >
                        <div
                          className={`p-3 rounded-xl ${
                            s.color === 'sky'
                              ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600'
                              : s.color === 'emerald'
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                                : 'bg-violet-50 dark:bg-violet-900/30 text-violet-600'
                          }`}
                        >
                          {s.icon}
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
