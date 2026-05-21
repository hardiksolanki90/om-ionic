import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useImportExport } from '../../hooks/useImportExport'
import { ImportExportButtons } from '../../components/ui/ImportExportButtons'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { DataTable, Column } from '../../components/ui/DataTable'
import { PageLayout } from '../../layouts/PageLayout'
import { Route } from '../../types/route'
import { parseUrlParams, buildUrlParams } from '../../lib/paginationUtils'
import { PaginationFooter } from '../../components/ui/PaginationFooter'
import { useRouteList, useCreateRoute, useUpdateRoute, useDeleteRoute } from '../../hooks/useRoutes'


export default function RouteList() {
  const importExport = useImportExport('routes')

  const navigate = useNavigate()
  const location = useLocation()

  const initialState = useMemo(() => parseUrlParams(location.search), [])
  const [currentPage, setCurrentPage] = useState(initialState.page)
  const [perPage,     setPerPage]     = useState(initialState.perPage)
  const [search,      setSearch]      = useState(initialState.searchQuery)

  // ── Sync state → URL ────────────────────────────────────────────────────────
  useEffect(() => {
    const newUrl = `${location.pathname}${buildUrlParams('', currentPage, perPage, search)}`
    if (newUrl !== location.pathname + location.search) navigate(newUrl, { replace: true })
  }, [currentPage, perPage, search, navigate, location.pathname, location.search])

  // ── Sync URL → state (back / forward) ───────────────────────────────────────
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return }
    const parsed = parseUrlParams(location.search)
    if (parsed.page        !== currentPage) setCurrentPage(parsed.page)
    if (parsed.perPage     !== perPage)     setPerPage(parsed.perPage)
    if (parsed.searchQuery !== search)      setSearch(parsed.searchQuery)
  }, [location.search])

  const { data, isLoading, isError, isFetching } = useRouteList(search, currentPage, perPage)
  const deleteRoute = useDeleteRoute()

  const rows = useMemo(() => data?.items ?? data?.routes ?? [], [data])
  const total = data?.total ?? 0
  const lastPage = data?.lastPage ?? 1

  const handleDelete = (r: Route) => {
    if (confirm('Delete route?')) deleteRoute.mutate(r.uuid)
  }


  const columns: Column<Route>[] = [
    { key: 'code', header: 'Code', sortable: true, render: r => <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">{r.code}</span> },
    { key: 'name', header: 'Route Name', sortable: true, render: r => <p className="font-medium text-slate-900 dark:text-slate-100">{r.name}</p> },
    { key: 'areaName', header: 'Area', render: r => <span className="text-sm text-slate-600 dark:text-slate-400">{r.areaName || '—'}</span> },
    {
      key: 'actions', header: '', align: 'right', width: '90px',
      render: r => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); navigate(`/routes/view/${r.uuid}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); navigate(`/routes/edit/${r.uuid}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); handleDelete(r) }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ]

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-5 gap-4">
        <p className="text-sm text-slate-500">{isLoading ? 'Loading…' : `${total} routes`}</p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 h-9 w-64 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-brand-400 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search routes…" className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none" />
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
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/routes/add')}>Add Route</Button>
        </div>
      </div>
      {isError && <p className="text-sm text-red-500 mb-3">Failed to load routes.</p>}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <DataTable columns={columns} data={rows} keyField="uuid" loading={isLoading} onRowClick={r => navigate(`/routes/view/${r.uuid}`)} emptyMessage="No routes found." />
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

      {isFetching && !isLoading && (
        <div className="fixed inset-0 bg-white/30 dark:bg-black/30 flex items-center justify-center z-50 pointer-events-none">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </PageLayout>
  )
}
