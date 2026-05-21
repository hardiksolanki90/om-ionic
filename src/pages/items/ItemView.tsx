import { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useItem, useItemStats, useItemStockLevels } from '../../hooks/useItems'
import {
  ChevronLeft,
  Pencil,
  Package,
  BarChart2,
  ShoppingBag,
  Tag,
  Hash,
  Layers,
  Warehouse,
  Star,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageLayout } from '../../layouts/PageLayout'
import { ItemSalesChart } from './ItemCharts'
import type { Item, SecondaryUom } from '../../types/item'

type TabId = 'details' | 'performance' | 'merchandising'
type RangeId = 'day' | 'week' | 'month'
type MetricId = 'unitsSold' | 'revenue'

function normalizeSecondaryUoms(raw: Item['secondaryUoms'] | undefined): SecondaryUom[] {
  if (!raw) {
    return []
  }
  if (Array.isArray(raw)) {
    return raw
  }
  return Object.values(raw as Record<string, SecondaryUom>)
}

const STAT_CARD_ICON_CLASS: Record<string, string> = {
  sky: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
}

export default function ItemView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabId>('details')
  const [range, setRange] = useState<RangeId>('week')
  const [metric, setMetric] = useState<MetricId>('unitsSold')

  const { data, isLoading, isError, refetch: refetchItem } = useItem(id ?? '')
  const item = data?.data

  const {
    data: performanceStats,
    isLoading: performanceLoading,
    isError: performanceError,
    refetch: refetchPerformance,
  } = useItemStats(id ?? '', range, activeTab === 'performance')

  const { data: monthStats, isLoading: monthStatsLoading } = useItemStats(
    id ?? '',
    'month',
    activeTab === 'details'
  )

  const {
    data: stockData,
    isLoading: stockLoading,
    isError: stockError,
    refetch: refetchStock,
  } = useItemStockLevels(id ?? '', activeTab === 'merchandising')

  const chartData = performanceStats?.chartData ?? []
  const summary = {
    totalUnits: performanceStats?.summary?.totalUnits ?? 0,
    totalRevenue: performanceStats?.summary?.totalRevenue ?? 0,
    totalOrders: performanceStats?.summary?.totalOrders ?? 0,
  }

  const monthSummary = {
    totalUnits: monthStats?.summary?.totalUnits ?? 0,
    totalRevenue: monthStats?.summary?.totalRevenue ?? 0,
    totalOrders: monthStats?.summary?.totalOrders ?? 0,
  }

  const stockLevels = stockData?.stockLevels ?? []

  const secondaryUoms = useMemo(
    () => normalizeSecondaryUoms(item?.secondaryUoms),
    [item?.secondaryUoms]
  )

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
  }, [])

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: 'Details', icon: <Package className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'merchandising', label: 'Merchandising', icon: <ShoppingBag className="w-4 h-4" /> },
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
          <p className="text-slate-500">Invalid item link.</p>
          <Button variant="outline" onClick={() => navigate('/items')}>
            Back to Items
          </Button>
        </div>
      </PageLayout>
    )
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
          Loading item…
        </div>
      </PageLayout>
    )
  }

  if (isError || !item?.uuid) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-slate-500">Item not found or failed to load.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchItem()}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => navigate('/items')}>
              Back to Items
            </Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="flex flex-col">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/items')}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} className="w-full h-full object-cover" alt="" />
                ) : (
                  <Package className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">{item.name}</h1>
                  <Badge variant={item.status === 1 ? 'success' : 'neutral'}>
                    {item.status === 1 ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{item.code}</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => navigate(`/items/edit/${item.uuid}`)}
          >
            Edit
          </Button>
        </div>

        <div className="mb-6" role="tablist" aria-label="Item sections">
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
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Description</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description || 'No description provided.'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Categorization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {field('Brand', item.brandName ?? item.brandId, <Tag className="w-4 h-4" />)}
                  {field('Category', item.categoryName ?? item.categoryId, <Layers className="w-4 h-4" />)}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Pricing & Units</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {field('Base Price', `$${Number(item.price).toFixed(2)}`, <DollarSign className="w-4 h-4" />)}
                  {field('Tax', item.tax ? `${item.tax}%` : '—', <Layers className="w-4 h-4" />)}
                  {field('Base UOM', item.baseUomName ?? item.baseUomId, <Package className="w-4 h-4" />)}
                  {field('Base UPC', item.baseUpc, <Hash className="w-4 h-4" />)}
                </div>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Secondary UOMs</p>
                  {secondaryUoms.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No secondary UOMs configured.</p>
                  ) : (
                    <div className="space-y-2">
                      {secondaryUoms.map((u: SecondaryUom) => (
                        <div
                          key={u.id ?? `${u.uomId}-${u.upc}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/40"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                {u.uomName || '—'}
                              </p>
                              {u.uomCode && (
                                <p className="text-xs font-mono text-slate-400 mt-0.5">{u.uomCode}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            {u.upc ? (
                              <p className="text-xs font-mono text-slate-500">UPC {u.upc}</p>
                            ) : (
                              <p className="text-xs text-slate-400">No UPC</p>
                            )}
                            {u.conversionFactor != null && u.conversionFactor !== 1 && (
                              <p className="text-xs text-slate-500 mt-0.5">×{u.conversionFactor}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-brand-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/20">
                <p className="text-brand-100 text-xs font-bold uppercase tracking-widest mb-1">
                  Total Revenue (This Month)
                </p>
                <p className="text-4xl font-bold">
                  {monthStatsLoading
                    ? '…'
                    : `$${monthSummary.totalRevenue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${STAT_CARD_ICON_CLASS.sky}`}>
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Orders (This Month)</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {monthStatsLoading ? '…' : monthSummary.totalOrders}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${STAT_CARD_ICON_CLASS.emerald}`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Units Sold (This Month)</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {monthStatsLoading ? '…' : monthSummary.totalUnits.toLocaleString()}
                    </p>
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
                      {item.name} · {range === 'day' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
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

        <div
          role="tabpanel"
          hidden={activeTab !== 'merchandising'}
          className={activeTab !== 'merchandising' ? 'hidden' : ''}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> Display Guidelines
              </h3>
              <div className="space-y-5">
                {field('Shelf Placement', item.merchandisingData?.shelfPlacement, <Layers className="w-4 h-4" />)}
                {field('Number of Facings', item.merchandisingData?.facings, <Package className="w-4 h-4" />)}
                {field(
                  'Min Stock Alert',
                  item.merchandisingData?.minStockAlert ? `${item.merchandisingData.minStockAlert} units` : null,
                  <AlertTriangle className="w-4 h-4" />
                )}
                {field('Promotional Note', item.merchandisingData?.promotionalNote, <Tag className="w-4 h-4" />)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-sky-500" /> Presales Notes
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.merchandisingData?.presalesNote || 'No presales notes added yet.'}
                </p>
              </div>

              {item.merchandisingData?.competitorPrice != null && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-500" /> Pricing Intelligence
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-700/40">
                      <p className="text-xs text-brand-600 font-bold uppercase tracking-wider">Our Price</p>
                      <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">
                        ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/40">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Competitor</p>
                      <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                        ${Number(item.merchandisingData.competitorPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`mt-3 text-xs font-semibold ${
                      Number(item.price) < Number(item.merchandisingData.competitorPrice)
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    }`}
                  >
                    {Number(item.price) < Number(item.merchandisingData.competitorPrice)
                      ? `✓ ${((1 - Number(item.price) / Number(item.merchandisingData.competitorPrice)) * 100).toFixed(0)}% cheaper than competitor`
                      : `✕ ${((Number(item.price) / Number(item.merchandisingData.competitorPrice) - 1) * 100).toFixed(0)}% more expensive than competitor`}
                  </p>
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-slate-500" /> Stock Levels
                </h3>

                {stockError && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <p className="text-red-600 dark:text-red-400 text-sm">Failed to load stock levels.</p>
                    <Button variant="outline" onClick={() => refetchStock()}>
                      Retry
                    </Button>
                  </div>
                )}

                {!stockError && stockLoading && (
                  <p className="text-sm text-slate-500 italic py-4">Loading stock levels…</p>
                )}

                {!stockError && !stockLoading && stockLevels.length === 0 && (
                  <p className="text-sm text-slate-500 italic py-4">No warehouse stock recorded for this item.</p>
                )}

                {!stockError && !stockLoading && stockLevels.length > 0 && (
                  <div className="space-y-3">
                    {stockLevels.map(wh => (
                      <div
                        key={wh.warehouseCode}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/40"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{wh.warehouseName}</p>
                          <p className="text-xs font-mono text-slate-400">{wh.warehouseCode}</p>
                        </div>
                        <Badge variant={wh.quantity > 20 ? 'success' : wh.quantity > 0 ? 'warning' : 'danger'}>
                          {wh.quantity} units
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
