import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useImportExport } from '../../hooks/useImportExport'
import { ImportExportButtons } from '../../components/ui/ImportExportButtons'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { DataTable, Column } from '../../components/ui/DataTable'
import type { Customer } from '../../types/customer'
import { PageLayout } from '../../layouts/PageLayout'
import { useCustomerList, useDeleteCustomer } from '../../hooks/useCustomers'
import { parseUrlParams, buildUrlParams } from '../../lib/paginationUtils'
import { PaginationFooter } from '../../components/ui/PaginationFooter'

export default function CustomerList() {
  const importExport = useImportExport('customers')
  const navigate = useNavigate()
  const location = useLocation()

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

  const { data, isLoading, isError, isFetching } = useCustomerList(search, currentPage, perPage)
  const deleteCustomer = useDeleteCustomer()

  const rows = useMemo(() => data?.items ?? data?.customers ?? [], [data])
  const total = data?.total ?? 0
  const lastPage = data?.lastPage ?? 1

  const openView = (c: Customer) => navigate(`/customers/view/${c.uuid}`)
  const openAdd = () => navigate('/customers/add')
  const openEdit = (c: Customer) => navigate(`/customers/edit/${c.uuid}`)

  const handleDelete = (c: Customer) => {
    if (confirm(`Delete ${c.shopName}?`)) deleteCustomer.mutate(c.uuid)
  }

  const columns: Column<Customer>[] = [
    {
      key: 'shopName', header: 'Customer / Shop', sortable: true,
      render: row => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{row.shopName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400 font-mono tracking-tighter bg-slate-100 px-1 rounded">{row.customerCode}</span>
            <span className="text-xs text-slate-500">{row.firstName} {row.lastName}</span>
          </div>
        </div>
      ),
    },
    { key: 'mobile', header: 'Mobile', render: row => <span className="font-mono text-xs">{row.mobile}</span> },
    { key: 'salesmanName', header: 'Salesman', render: row => <span className="text-sm text-slate-600 dark:text-slate-400">{row.salesmanName || '—'}</span> },
    {
      key: 'status', header: 'Status', align: 'center',
      render: row => <Badge variant={row.status === 1 ? 'success' : 'neutral'}>{row.status === 1 ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions', header: '', align: 'right', width: '90px',
      render: row => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={e => { e.stopPropagation(); openView(row) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); openEdit(row) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleDelete(row) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-5 gap-4">
        <p className="text-sm text-slate-500">
          {isLoading ? 'Loading…' : `${total} customer${total !== 1 ? 's' : ''}`}
        </p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 h-9 w-64 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Search customers…"
              className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
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
          <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>
            Add Customer
          </Button>
        </div>
      </div>

      {isError && <p className="text-sm text-red-500 mb-3">Failed to load customers.</p>}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          keyField="uuid"
          loading={isLoading}
          onRowClick={openView}
          emptyMessage="No customers found. Add your first customer."
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
