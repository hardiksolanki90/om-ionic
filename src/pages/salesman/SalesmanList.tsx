import { useState } from 'react'
import { useImportExport } from '../../hooks/useImportExport'
import { ImportExportButtons } from '../../components/ui/ImportExportButtons'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { DataTable, Column } from '../../components/ui/DataTable'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../../layouts/PageLayout'
import { Salesman } from '../../types/salesman'
import { useSalesmanList, useCreateSalesman, useUpdateSalesman, useDeleteSalesman } from '../../hooks/useSalesman'


export default function SalesmanList() {
  const importExport = useImportExport('salesman')

  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { data, isLoading, isError } = useSalesmanList(search)
  const deleteSalesman = useDeleteSalesman()

  const rows = data?.items ?? []

  const handleDelete = (r: Salesman) => {
    if (confirm('Delete salesman?')) deleteSalesman.mutate(r.uuid)
  }

  const columns: Column<Salesman>[] = [
    {
      key: 'name', header: 'Salesman', sortable: true,
      render: r => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-600 flex-shrink-0">
            {r.firstName?.[0]}{r.lastName?.[0] ?? ''}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{r.firstName} {r.lastName}</p>
            <p className="text-xs text-slate-400">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'code', header: 'Code', sortable: true },
    {
      key: 'salesmanType', header: 'Type', align: 'center',
      render: r => <Badge variant={r.salesmanType === 'Salesman' ? 'info' : 'warning'}>{r.salesmanType}</Badge>,
    },
    { key: 'mobile', header: 'Mobile', sortable: false },
    {
      key: 'actions', header: '', align: 'right', width: '90px',
      render: r => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={e => { e.stopPropagation(); navigate(`/salesman/view/${r.uuid}`) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          ><Eye className="w-4 h-4" /></button>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/salesman/edit/${r.uuid}`) }}
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
      <div className="flex items-center justify-between mb-5 gap-4">
        <p className="text-sm text-slate-500">{rows.length} salesman{rows.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 h-9 w-64 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-brand-400 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search salesman…"
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
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/salesman/add')}>
            Add Salesman
          </Button>
        </div>
      </div>

      {isError && <p className="text-sm text-red-500 mb-3">Failed to load salesman.</p>}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          keyField="uuid"
          onRowClick={r => navigate(`/salesman/view/${r.uuid}`)}
          emptyMessage={isLoading ? 'Loading…' : 'No salesman found.'}
        />
      </div>

    </PageLayout>
  )
}
