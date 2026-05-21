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
import { Item } from '../../types/item'
import { useItemList, useDeleteItem } from '../../hooks/useItems'
import { parseUrlParams, buildUrlParams } from '../../lib/paginationUtils'
import { PaginationFooter } from '../../components/ui/PaginationFooter'

export default function ItemList() {
  const navigate = useNavigate()
  const location = useLocation()
  const [present] = useIonToast()
  const importExport = useImportExport('items')

  const initialState = useMemo(() => parseUrlParams(location.search), [])
  const [currentPage, setCurrentPage] = useState(initialState.page)
  const [perPage, setPerPage] = useState(initialState.perPage)
  const [search, setSearch] = useState(initialState.searchQuery)

  useEffect(() => {
    const newUrl = `${location.pathname}${buildUrlParams('', currentPage, perPage, search)}`
    if (newUrl !== location.pathname + location.search) {
      navigate(newUrl, { replace: true })
    }
  }, [currentPage, perPage, search, navigate, location.pathname, location.search])

  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const parsed = parseUrlParams(location.search)
    if (parsed.page !== currentPage) setCurrentPage(parsed.page)
    if (parsed.perPage !== perPage) setPerPage(parsed.perPage)
    if (parsed.searchQuery !== search) setSearch(parsed.searchQuery)
  }, [location.search])

  const { data, isLoading, isError, isFetching } = useItemList(search, currentPage, perPage)
  const deleteItem = useDeleteItem()

  const rows = useMemo(() => data?.items ?? [], [data])
  const total = data?.total ?? 0
  const lastPage = data?.lastPage ?? 1

  const showError = (msg: string) =>
    present({ message: msg, duration: 3000, position: 'top', color: 'danger' })

  const showSuccess = (msg: string) =>
    present({ message: msg, duration: 2500, position: 'top', color: 'success' })

  const handleDelete = async (r: Item) => {
    if (!confirm('Delete this item?')) return
    try {
      await deleteItem.mutateAsync(r.uuid)
      showSuccess('Item deleted.')
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Failed to delete item.')
    }
  }

  const columns: Column<Item>[] = [
    {
      key: 'name', header: 'Item', sortable: true, render: r => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {r.image
              ? <img src={r.image} className="w-full h-full object-cover" alt={r.name} />
              : <p className="text-[10px] text-slate-400 font-bold">PROD</p>
            }
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100 leading-none">{r.name}</p>
            <p className="text-xs text-slate-400 font-mono mt-1">{r.code}</p>
          </div>
        </div>
      )
    },
    { key: 'categoryName', header: 'Category', render: r => r.categoryName ?? '—' },
    { key: 'brandName', header: 'Brand', render: r => r.brandName ?? '—' },
    { key: 'price', header: 'Price', align: 'right', render: r => `$${Number(r.price).toFixed(2)}` },
    { key: 'tax', header: 'Tax', align: 'center', render: r => <span className="font-mono text-sm">{r.tax ? `${r.tax}%` : '—'}</span> },
    {
      key: 'status', header: 'Status', align: 'center', render: r => (
        <Badge variant={r.status === 1 ? 'success' : 'neutral'}>{r.status === 1 ? 'Active' : 'Inactive'}</Badge>
      )
    },
    {
      key: 'actions', header: '', align: 'right', width: '90px', render: r => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); navigate(`/items/view/${r.uuid}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); navigate(`/items/edit/${r.uuid}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); handleDelete(r) }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ]

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-5 gap-4">
        <p className="text-sm text-slate-500">{isLoading ? 'Loading…' : `${total} item${total !== 1 ? 's' : ''}`}</p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 h-9 w-64 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-brand-400 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Search items…"
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
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/items/add')}>Add Item</Button>
        </div>
      </div>

      {isError && <p className="text-sm text-red-500 mb-3">Failed to load items.</p>}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          keyField="uuid"
          loading={isLoading}
          onRowClick={r => navigate(`/items/view/${r.uuid}`)}
          emptyMessage="No items found."
        />
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
