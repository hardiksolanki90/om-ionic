import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  BarChart3, Search, ChevronLeft, ChevronRight,
  RefreshCw, Calendar, X, FileDown, Filter,
} from 'lucide-react'
import { PageLayout } from '../../layouts/PageLayout'
import { DataTable } from '../../components/ui/DataTable'
import { Button } from '../../components/ui/Button'
import { getReportColumns, isSnapshotReport } from '../../lib/reporting/reportColumns'
import { useReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../services/reportingService'

// ─── Meta ────────────────────────────────────────────────────────────────────

type FilterKey = 'dateRange' | 'search' | 'salesman' | 'customer' | 'warehouse' | 'category' | 'brand' | 'threshold'

interface ReportMeta {
  title: string
  description: string
  filters: ReadonlyArray<FilterKey>
}

const REPORT_META: Record<string, ReportMeta> = {
  'sales-summary': {
    title: 'Sales Summary',
    description: 'Daily sales totals — orders, quantity, gross and net sales for the selected period.',
    filters: ['dateRange', 'search'],
  },
  'sales-summary-category-wise': {
    title: 'Sales Summary — Category Wise',
    description: 'Sales totals grouped by item category for the selected period.',
    filters: ['dateRange', 'category'],
  },
  'order-management': {
    title: 'Order Management',
    description: 'Order volume, revenue, and line-level detail for the selected period.',
    filters: ['dateRange', 'search', 'salesman', 'customer'],
  },
  'customer-sales': {
    title: 'Customer Sales',
    description: 'Customer and salesman performance with daily sales trends.',
    filters: ['dateRange', 'search', 'salesman'],
  },
  'returns-logistics': {
    title: 'Returns & Logistics',
    description: 'Return volumes, values, and line-level reverse logistics for the period.',
    filters: ['dateRange', 'search', 'salesman'],
  },
  'inventory-stock': {
    title: 'Inventory & Stock',
    description: 'Current stock levels by item and warehouse (snapshot as of today).',
    filters: ['search', 'warehouse'],
  },
  'warehouse-operations': {
    title: 'Warehouse Operations',
    description: 'Stock distribution and throughput by warehouse location.',
    filters: ['search', 'warehouse'],
  },
  'stock-summary': {
    title: 'Stock Summary',
    description: 'Total stock quantity per item across all warehouses.',
    filters: ['search', 'category'],
  },
  'stock-detail-report': {
    title: 'Stock Detail Report',
    description: 'Stock quantity by warehouse and item (godown-wise detail).',
    filters: ['search', 'warehouse', 'category'],
  },
  'low-stock-summary': {
    title: 'Low Stock Summary',
    description: 'Items at or below the low-stock threshold (default 10 units).',
    filters: ['search', 'threshold'],
  },
  'rate-list': {
    title: 'Rate List',
    description: 'Item master with selling rates, category, brand, and UOM.',
    filters: ['search', 'category', 'brand'],
  },
  'item-sales-purchase-summary': {
    title: 'Item Sales & Purchase Summary',
    description: 'Sales quantity and value per item for the period.',
    filters: ['dateRange', 'search', 'category'],
  },
  'item-report-by-party': {
    title: 'Item Report by Party',
    description: 'Sales quantity and value by customer (party) and item.',
    filters: ['dateRange', 'search', 'customer'],
  },
}

// ─── Date utilities ──────────────────────────────────────────────────────────

function fmt(d: Date): string { return d.toISOString().slice(0, 10) }
function today(): string { return fmt(new Date()) }

type DatePreset = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

interface DateRange { from: string; to: string }

const PRESET_LABELS: Record<DatePreset, string> = {
  day: 'Today', week: 'This Week', month: 'This Month',
  quarter: 'This Quarter', year: 'This Year', custom: 'Custom Range',
}
const PRESETS: DatePreset[] = ['day', 'week', 'month', 'quarter', 'year', 'custom']

function presetRange(p: Exclude<DatePreset, 'custom'>): DateRange {
  const now = new Date()
  switch (p) {
    case 'day':    return { from: fmt(now), to: fmt(now) }
    case 'week': {
      const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7))
      return { from: fmt(mon), to: fmt(now) }
    }
    case 'month':  return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: fmt(now) }
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3)
      return { from: fmt(new Date(now.getFullYear(), q * 3, 1)), to: fmt(now) }
    }
    case 'year':   return { from: fmt(new Date(now.getFullYear(), 0, 1)), to: fmt(now) }
  }
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100]

// ─── Field components ─────────────────────────────────────────────────────────

const inputCls = 'h-9 w-full px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all'
const labelCls = 'block text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-w-0">
      <span className={labelCls}>{label}</span>
      {children}
    </div>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className={`${inputCls} appearance-none pr-8 cursor-pointer`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
      }}
    />
  )
}

// ─── Active filter chips ───────────────────────────────────────────────────────

interface ChipProps { label: string; value: string; onClear: () => void }

function Chip({ label, value, onClear }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 text-xs font-medium text-brand-700 dark:text-brand-300">
      <span className="text-brand-400 dark:text-brand-500 font-normal">{label}:</span>
      {value}
      <button
        onClick={onClear}
        className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-brand-200 dark:hover:bg-brand-700 transition-colors"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  )
}

// ─── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number; lastPage: number; total: number
  perPage: number; onPage: (p: number) => void; onPerPage: (n: number) => void
}

function Pagination({ page, lastPage, total, perPage, onPage, onPerPage }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to   = Math.min(page * perPage, total)

  const pageNums = (() => {
    if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1)
    if (page <= 4)     return [1, 2, 3, 4, 5, -1, lastPage]
    if (page >= lastPage - 3) return [1, -1, lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage]
    return [1, -1, page - 1, page, page + 1, -1, lastPage]
  })()

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
      <div className="flex items-center gap-2.5">
        <span className="text-xs text-slate-500 dark:text-slate-400">Rows per page</span>
        <SelectInput
          value={perPage}
          onChange={e => onPerPage(Number(e.target.value))}
          className="h-8 text-xs w-[70px]"
        >
          {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </SelectInput>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          {from}–{to} <span className="text-slate-400">of</span> {total.toLocaleString()} records
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onPage(1)} disabled={page <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-medium"
          >«</button>
          <button
            onClick={() => onPage(page - 1)} disabled={page <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          ><ChevronLeft className="w-4 h-4" /></button>

          {pageNums.map((p, i) =>
            p === -1 ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p)}
                className={[
                  'w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                  p === page
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
                ].join(' ')}
              >{p}</button>
            )
          )}

          <button
            onClick={() => onPage(page + 1)} disabled={page >= lastPage}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          ><ChevronRight className="w-4 h-4" /></button>
          <button
            onClick={() => onPage(lastPage)} disabled={page >= lastPage}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-medium"
          >»</button>
        </div>
      </div>
    </div>
  )
}

// ─── Not found ────────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-600">
        <BarChart3 className="w-12 h-12 mb-3 opacity-40" />
        <p className="text-sm font-medium">Report not found</p>
      </div>
    </PageLayout>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const meta     = REPORT_META[slug]
  const snapshot = isSnapshotReport(slug)

  const defaultRange = snapshot ? { from: '', to: '' } : presetRange('month')

  const [preset,    setPreset]    = useState<DatePreset>('month')
  const [dateFrom,  setDateFrom]  = useState(defaultRange.from)
  const [dateTo,    setDateTo]    = useState(defaultRange.to)
  const [search,    setSearch]    = useState('')
  const [threshold, setThreshold] = useState(10)
  const [page,      setPage]      = useState(1)
  const [perPage,   setPerPage]   = useState(25)

  const [applied, setApplied] = useState<ReportFilters>(() => ({
    dateFrom: snapshot ? undefined : defaultRange.from,
    dateTo:   snapshot ? undefined : defaultRange.to,
    page: 1, perPage: 25,
  }))

  const { data, isFetching, refetch } = useReport(slug, applied)

  const handlePreset = useCallback((p: DatePreset) => {
    setPreset(p)
    if (p !== 'custom') {
      const range = presetRange(p)
      setDateFrom(range.from)
      setDateTo(range.to)
      // Immediately apply — no need to click Run Report for named presets
      setPage(1)
      setApplied(prev => ({ ...prev, dateFrom: range.from, dateTo: range.to, page: 1 }))
    }
  }, [])

  const run = useCallback(() => {
    const next: ReportFilters = { page: 1, perPage: applied.perPage }
    if (!snapshot) { next.dateFrom = dateFrom; next.dateTo = dateTo }
    if (search) next.search = search
    if (meta?.filters.includes('threshold')) next.threshold = threshold
    setPage(1)
    setApplied(next)
  }, [snapshot, dateFrom, dateTo, search, threshold, applied.perPage, meta])

  const reset = useCallback(() => {
    const range = snapshot ? { from: '', to: '' } : presetRange('month')
    setPreset('month'); setDateFrom(range.from); setDateTo(range.to)
    setSearch(''); setThreshold(10); setPage(1)
    setApplied({ dateFrom: range.from || undefined, dateTo: range.to || undefined, page: 1, perPage: applied.perPage })
  }, [snapshot, applied.perPage])

  const handlePage    = useCallback((p: number) => { setPage(p); setApplied(prev => ({ ...prev, page: p })) }, [])
  const handlePerPage = useCallback((n: number) => { setPerPage(n); setPage(1); setApplied(prev => ({ ...prev, perPage: n, page: 1 })) }, [])

  const [filtersOpen, setFiltersOpen] = useState(true)

  if (!meta) return <NotFound />

  const columns  = getReportColumns(slug)
  const rows     = data?.data    ?? []
  const total    = data?.total   ?? 0
  const lastPage = data?.lastPage ?? 1
  const hasDate  = meta.filters.includes('dateRange') && !snapshot

  // Active filter chips
  const chips: { label: string; value: string; clear: () => void }[] = []
  if (applied.dateFrom && applied.dateTo) chips.push({ label: 'Period', value: `${applied.dateFrom} → ${applied.dateTo}`, clear: () => setApplied(p => ({ ...p, dateFrom: undefined, dateTo: undefined })) })
  if (applied.search)  chips.push({ label: 'Search',    value: applied.search,            clear: () => { setSearch('');    setApplied(p => ({ ...p, search: undefined })) } })
  if (applied.threshold != null && meta.filters.includes('threshold')) chips.push({ label: 'Threshold', value: String(applied.threshold), clear: () => { setThreshold(10); setApplied(p => ({ ...p, threshold: undefined })) } })

  const activeFilterCount = chips.length

  return (
    <PageLayout>
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-brand-500" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{meta.title}</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-[42px]">{meta.description}</p>
        </div>

        <button
          title="Export"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* ── Filter panel ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 mb-4 overflow-hidden">

        {/* Panel header — clickable to toggle */}
        <button
          type="button"
          onClick={() => setFiltersOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50/80 dark:bg-slate-950/40 hover:bg-slate-100/80 dark:hover:bg-slate-950/60 transition-colors border-b border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Filter &amp; Parameters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <span
                role="button"
                onClick={e => { e.stopPropagation(); reset() }}
                className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
              >
                Clear all
              </span>
            )}
            <ChevronRight
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${filtersOpen ? 'rotate-90' : ''}`}
            />
          </div>
        </button>

        {/* Collapsible body */}
        <div className={`overflow-hidden transition-all duration-200 ${filtersOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {/* Filter fields */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Date preset */}
            {hasDate && (
              <Field label="Period">
                <SelectInput value={preset} onChange={e => handlePreset(e.target.value as DatePreset)}>
                  {PRESETS.map(p => <option key={p} value={p}>{PRESET_LABELS[p]}</option>)}
                </SelectInput>
                {preset !== 'custom' && dateFrom && dateTo && (
                  <span className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                    {dateFrom} → {dateTo}
                  </span>
                )}
              </Field>
            )}

            {/* Custom date inputs */}
            {hasDate && preset === 'custom' && (
              <>
                <Field label="From date">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <TextInput
                      type="date"
                      value={dateFrom}
                      max={dateTo || today()}
                      onChange={e => setDateFrom(e.target.value)}
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </Field>
                <Field label="To date">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <TextInput
                      type="date"
                      value={dateTo}
                      min={dateFrom}
                      max={today()}
                      onChange={e => setDateTo(e.target.value)}
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </Field>
              </>
            )}

            {/* Search */}
            {meta.filters.includes('search') && (
              <Field label="Search">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <TextInput
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && run()}
                    placeholder="Name, code, etc."
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
            )}

            {/* Low stock threshold */}
            {meta.filters.includes('threshold') && (
              <Field label="Low stock threshold">
                <TextInput
                  type="number"
                  min={0}
                  value={threshold}
                  onChange={e => setThreshold(Number(e.target.value))}
                  placeholder="10"
                />
              </Field>
            )}

          </div>

          {/* Snapshot note */}
          {snapshot && (
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Snapshot report — reflects current stock state, no date range needed.
            </p>
          )}
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40">
          {/* Active chips */}
          <div className="flex flex-wrap gap-2">
            {chips.map(c => (
              <Chip key={c.label} label={c.label} value={c.value} onClear={c.clear} />
            ))}
            {chips.length === 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-600 italic">No active filters</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <Button onClick={run} disabled={isFetching} className="h-9 px-6 text-sm font-semibold">
              {isFetching ? 'Loading…' : 'Run Report'}
            </Button>
          </div>
        </div>
        </div>{/* end collapsible */}
      </div>

      {/* ── Results table ── */}
      {columns.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Table toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Results
              {total > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {total.toLocaleString()} record{total !== 1 ? 's' : ''}
                </span>
              )}
            </span>
          </div>

          <DataTable
            columns={columns}
            data={rows}
            keyField="id"
            loading={isFetching}
            emptyMessage="No records match the selected filters. Adjust and run report."
          />

          {total > 0 && (
            <Pagination
              page={page} lastPage={lastPage} total={total} perPage={perPage}
              onPage={handlePage} onPerPage={handlePerPage}
            />
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-600">
          <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">Column definitions not yet configured for this report.</p>
        </div>
      )}
    </PageLayout>
  )
}
