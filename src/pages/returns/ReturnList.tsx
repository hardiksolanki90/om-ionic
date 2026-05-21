import { useState, useMemo } from 'react'
import { useImportExport } from '../../hooks/useImportExport'
import { ImportExportButtons } from '../../components/ui/ImportExportButtons'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { DataTable, Column } from '../../components/ui/DataTable'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input, Select } from '../../components/ui/Input'
import { PageLayout } from '../../layouts/PageLayout'
import { Return } from '../../types/return'
import { useNavigate } from 'react-router-dom'
const STATUS_V: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> = { Approved: 'success', Pending: 'warning', Processing: 'info', Rejected: 'danger', Refunded: 'success' }



import { useIonToast } from '@ionic/react'
import { useReturnList, useDeleteReturn, useReturn } from '../../hooks/useReturns'

export default function ReturnList() {
  const importExport = useImportExport('returns')
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'none' | 'view'>('none')
  const [selected, setSelected] = useState<Return | null>(null)
  
  const { data, isLoading } = useReturnList(search)
  const deleteReturn = useDeleteReturn()

  const { data: detailData, isLoading: detailLoading } = useReturn(selected?.uuid ?? '')
  const viewReturn = detailData?.data ?? selected

  const mappedReturns = useMemo(() => data?.items ?? [], [data])

  const close = () => setModal('none')
  const fv = (l: string, v: unknown) => (<div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{l}</p><p className="text-slate-900 dark:text-slate-100">{String(v ?? '—')}</p></div>)
  const columns: Column<Return>[] = [
    { key: 'returnCode' as keyof Return, header: 'Return', sortable: true, render: r => <span className="font-mono text-xs text-slate-600 dark:text-slate-100">{r.returnCode || '—'}</span> },
    { key: 'customerName', header: 'Customer', sortable: true, render: r => <div><p className="font-medium text-slate-900 dark:text-slate-100">{r.customerName ?? '—'}</p><p className="text-xs text-slate-400">{r.shopName}</p></div> },
    { key: 'salesmanName', header: 'Salesman', render: r => <span className="text-sm text-slate-600 dark:text-slate-300">{r.salesmanName ?? '—'}</span> },
    { key: 'netTotal', header: 'Total', align: 'right', render: r => <span className="font-semibold">${r.netTotal?.toFixed(2)}</span> },
    { key: 'status', header: 'Status', align: 'center', render: r => <Badge variant={r.status === 1 ? 'success' : 'neutral'}>{r.status === 1 ? 'Active' : 'Inactive'}</Badge> },
    { key: 'returnDate', header: 'Date', render: r => <span>{r.returnDate || '—'}</span> },
    {
      key: 'actions', header: '', align: 'right', width: '90px', render: r => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); setSelected(r); setModal('view') }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); navigate(`/returns/edit/${(r as any).uuid}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); if (confirm('Delete return?')) deleteReturn.mutate((r as any).uuid) }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ]
  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-5 gap-4">
        <p className="text-sm text-slate-500">{mappedReturns.length} returns</p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 h-9 w-64 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-brand-400 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search returns…" className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none" />
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
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/returns/add')}>Add Return</Button>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-slate-500">Loading...</div>
        ) : (
          <DataTable columns={columns} data={mappedReturns} keyField="id" onRowClick={r => { setSelected(r); setModal('view') }} emptyMessage="No returns found." />
        )}
      </div>
      <SlidePanel width="full" isOpen={modal === 'view'} onClose={close} title={`Return #${viewReturn?.returnCode ?? ''}`} subtitle={viewReturn?.returnDate}
        footer={<div className="flex items-center gap-3 ml-auto"><Button variant="outline" onClick={close}>Close</Button><Button icon={<Pencil className="w-4 h-4" />} onClick={() => { if (selected) navigate(`/returns/edit/${(selected as any).uuid}`) }}>Edit</Button></div>}>
        {viewReturn && (
          <div className="space-y-6">
            {/* Header card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                    {viewReturn.customer ? `${viewReturn.customer.firstName} ${viewReturn.customer.lastName}` : (viewReturn.customerName ?? '—')}
                  </p>
                  <p className="text-sm text-slate-400">{viewReturn.customer?.shopName ?? viewReturn.shopName}</p>
                </div>
                <Badge variant={viewReturn.status === 1 ? 'success' : 'neutral'}>{viewReturn.status === 1 ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>

            {/* Return info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {fv('Return Code', viewReturn.returnCode)}
              {fv('Date', viewReturn.returnDate)}
              {fv('Salesman', viewReturn.salesman ? `${viewReturn.salesman.firstName} ${viewReturn.salesman.lastName}` : (viewReturn.salesmanName ?? '—'))}
              {fv('Status', viewReturn.currentStatus ?? '—')}
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Items</p>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden relative">
                {detailLoading && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10">
                    <span className="text-sm text-slate-500">Loading details...</span>
                  </div>
                )}
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Item</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Price</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Discount</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {(viewReturn.items ?? viewReturn.returnItems ?? []).map((item: any, i: number) => (
                      <tr key={item.id ?? i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100">{item.itemName ?? item.item?.name ?? `Item ${item.itemId}`}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300">{item.price?.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300">{item.discount?.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">{item.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                    {(viewReturn.items ?? viewReturn.returnItems ?? []).length === 0 && !detailLoading && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-xs">No items</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300"><span>Gross Total</span><span>{viewReturn.grossTotal?.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300"><span>Tax</span><span>{viewReturn.totalTax?.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300"><span>Rounding</span><span>{viewReturn.rounding?.toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-bold text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700 pt-2"><span>Net Total</span><span>{viewReturn.netTotal?.toFixed(2)}</span></div>
              </div>
            </div>

            {viewReturn.customerNote && (
              <div>{fv('Customer Note', viewReturn.customerNote)}</div>
            )}
          </div>
        )}
      </SlidePanel>
    </PageLayout>
  )
}
