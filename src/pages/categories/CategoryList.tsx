import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCategoryList, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories'
import { useImportExport } from '../../hooks/useImportExport'
import { ImportExportButtons } from '../../components/ui/ImportExportButtons'
import { Category, isCategoryActive } from '../../types/category'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { DataTable, Column } from '../../components/ui/DataTable'
import { PageLayout } from '../../layouts/PageLayout'
import { PaginationFooter } from '../../components/ui/PaginationFooter'

// ─── Constants ────────────────────────────────────────────────────────────────
const PER_PAGE_OPTIONS = [10, 15, 20, 50]
const DEFAULT_PER_PAGE = 15


// ─── URL helpers (same pattern as reference OrderList) ────────────────────────
function parseUrlParams(search: string): { page: number; perPage: number; searchQuery: string } {
  const params = new URLSearchParams(search)
  const page    = parseInt(params.get('page')    || '1',  10)
  const perPage = parseInt(params.get('perPage') || String(DEFAULT_PER_PAGE), 10)
  return {
    page:        isNaN(page)    || page    < 1 ? 1 : page,
    perPage:     PER_PAGE_OPTIONS.includes(perPage) ? perPage : DEFAULT_PER_PAGE,
    searchQuery: params.get('search') || '',
  }
}

function buildUrlParams(page: number, perPage: number, search: string): string {
  const params = new URLSearchParams()
  if (page    > 1)                params.set('page',    String(page))
  if (perPage !== DEFAULT_PER_PAGE) params.set('perPage', String(perPage))
  if (search.trim())              params.set('search',  search.trim())
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export default function CategoryList() {
  const navigate     = useNavigate()
  const location     = useLocation()
  const importExport = useImportExport('categories')

  // Parse initial state from URL once
  const initialState = useMemo(() => parseUrlParams(location.search), [])

  const [currentPage, setCurrentPage] = useState(initialState.page)
  const [perPage,     setPerPage]     = useState(initialState.perPage)
  const [search,      setSearch]      = useState(initialState.searchQuery)

  // ── Sync state → URL ────────────────────────────────────────────────────────
  useEffect(() => {
    const newUrl = `/categories${buildUrlParams(currentPage, perPage, search)}`
    const cur    = location.pathname + (location.search || '')
    if (newUrl !== cur) navigate(newUrl, { replace: true })
  }, [currentPage, perPage, search])

  // ── Sync URL → state (back / forward) ───────────────────────────────────────
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return }
    const parsed = parseUrlParams(location.search)
    if (parsed.page        !== currentPage) setCurrentPage(parsed.page)
    if (parsed.perPage     !== perPage)     setPerPage(parsed.perPage)
    if (parsed.searchQuery !== search)      setSearch(parsed.searchQuery)
  }, [location.search])

  // ── Data fetching ────────────────────────────────────────────────────────────
  const { data, isLoading, isError, isFetching } = useCategoryList(search, currentPage, perPage)
  const deleteCategory = useDeleteCategory()

  const rows       = data?.categories ?? data?.items ?? []
  const total      = data?.total      ?? 0
  const lastPage   = data?.lastPage   ?? 1



  const handleDelete = (category: Category) => {
    if (confirm('Delete category?')) deleteCategory.mutate(category.uuid)
  }

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns: Column<Category>[] = [
    {
      key: 'name', header: 'Category Name', sortable: true,
      render: r => <span className="font-medium text-slate-900 dark:text-slate-100">{r.name}</span>,
    },
    { key: 'code', header: 'Code', sortable: true, render: r => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    { key: 'tax',  header: 'Tax',  align: 'center', render: r => <span className="font-mono text-sm">{r.tax || '—'}</span> },
    {
      key: 'status', header: 'Status', align: 'center',
      render: r => {
        const active = isCategoryActive(r.status)
        return <Badge variant={active ? 'success' : 'neutral'}>{active ? 'Active' : 'Inactive'}</Badge>
      },
    },
    {
      key: 'actions', header: '', align: 'right', width: '90px',
      render: r => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={e => { e.stopPropagation(); navigate(`/categories/view/${r.uuid}`) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          ><Eye className="w-4 h-4" /></button>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/categories/edit/${r.uuid}`) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          ><Pencil className="w-4 h-4" /></button>
          <button
            onClick={e => { e.stopPropagation(); handleDelete(r) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          ><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ]

  return (
    <PageLayout>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <p className="text-sm text-slate-500">
          {isLoading ? 'Loading…' : `${total} categories`}
        </p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 h-9 w-64 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-brand-400 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Search categories…"
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <ImportExportButtons
            exporting={importExport.exporting}
            importing={importExport.importing}
            result={importExport.result}
            importModalOpen={importExport.importModalOpen}
            requiredFields={importExport.requiredFields}
            onExport={importExport.exportData}
            onDownloadTemplate={importExport.downloadTemplate}
            onOpenImport={importExport.openImportModal}
            onCloseImport={importExport.closeImportModal}
            onConfirmImport={importExport.confirmImport}
            onClearResult={importExport.clearResult}
          />
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/categories/add')}>Add Category</Button>
        </div>
      </div>

      {isError && <p className="text-sm text-red-500 mb-3">Failed to load categories.</p>}

      {/* ── Table ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          keyField="uuid"
          loading={isLoading}
          onRowClick={r => navigate(`/categories/view/${r.uuid}`)}
          emptyMessage="No categories found."
        />

        {/* ── Pagination footer ── */}
        {!isLoading && lastPage > 0 && (
          <PaginationFooter
            currentPage={currentPage}
            lastPage={lastPage}
            total={total}
            perPage={perPage}
            isFetching={isFetching}
            onPageChange={setCurrentPage}
            onPerPageChange={(p) => { setPerPage(p); setCurrentPage(1) }}
          />
        )}
      </div>

      {/* Fetching overlay (page transitions) */}
      {isFetching && !isLoading && (
        <div className="fixed inset-0 bg-white/30 dark:bg-black/30 flex items-center justify-center z-50 pointer-events-none">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

    </PageLayout>
  )
}
