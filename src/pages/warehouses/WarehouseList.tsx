import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import { useImportExport } from '../../hooks/useImportExport'
import { ImportExportButtons } from '../../components/ui/ImportExportButtons'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { DataTable, Column } from '../../components/ui/DataTable'
import { PageLayout } from '../../layouts/PageLayout'
import { Warehouse, isWarehouseActive } from '../../types/warehouse'
import { parseUrlParams, buildUrlParams } from '../../lib/paginationUtils'
import { PaginationFooter } from '../../components/ui/PaginationFooter'

import { useWarehouseList, useWarehouse, useDeleteWarehouse, useCreateWarehouse, useUpdateWarehouse } from '../../hooks/useWarehouses'



export default function WarehouseList() {
  const importExport = useImportExport('warehouses')

  const navigate = useNavigate()
  const location = useLocation()

  const initialState = useMemo(() => parseUrlParams(location.search), [])
  const [currentPage, setCurrentPage] = useState(initialState.page)
  const [perPage, setPerPage] = useState(initialState.perPage)
  const [search, setSearch] = useState(initialState.searchQuery)
  const [present] = useIonToast()

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
    if (parsed.page !== currentPage) setCurrentPage(parsed.page)
    if (parsed.perPage !== perPage) setPerPage(parsed.perPage)
    if (parsed.searchQuery !== search) setSearch(parsed.searchQuery)
  }, [location.search])

  const { data, isLoading, isError, isFetching } = useWarehouseList(search, currentPage, perPage)
  const deleteWarehouse = useDeleteWarehouse()

  const rows = useMemo(() => data?.items ?? [], [data])
  const total = data?.total ?? 0
  const lastPage = data?.lastPage ?? 1


  const columns: Column<Warehouse>[] = [
    {
      key: 'name', header: 'Warehouse', sortable: true,
      render: r => <div><p className="font-medium text-slate-900 dark:text-slate-100">{r.name}</p><p className="text-xs font-mono text-slate-400">{r.code}</p></div>,
    },
    { key: 'address', header: 'Address', render: r => <span className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs block">{r.address || '—'}</span> },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: r => (
        <Badge variant={isWarehouseActive(r.status) ? 'success' : 'neutral'}>
          {isWarehouseActive(r.status) ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions', header: '', align: 'right', width: '90px',
      render: r => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); navigate(`/warehouses/view/${r.uuid}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); navigate(`/warehouses/edit/${r.uuid}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); if (confirm('Delete warehouse?')) deleteWarehouse.mutate(r.uuid) }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ]

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-5 gap-4">
        <p className="text-sm text-slate-500">{isLoading ? 'Loading…' : `${total} warehouses`}</p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 h-9 w-64 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-brand-400 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search warehouses…" className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none" />
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
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/warehouses/add')}>Add Warehouse</Button>
        </div>
      </div>
      {isError && <p className="text-sm text-red-500 mb-3">Failed to load warehouses.</p>}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <DataTable columns={columns} data={rows} keyField="uuid" loading={isLoading} onRowClick={r => navigate(`/warehouses/view/${r.uuid}`)} emptyMessage="No warehouses found." />
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
