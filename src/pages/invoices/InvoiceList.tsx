import { useState } from 'react'
import { useImportExport } from '../../hooks/useImportExport'
import { ImportExportButtons } from '../../components/ui/ImportExportButtons'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { DataTable, Column } from '../../components/ui/DataTable'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { PageLayout } from '../../layouts/PageLayout'
import { useNavigate } from 'react-router-dom'
import { useInvoiceList, useInvoice, useDeleteInvoice } from '../../hooks/useInvoices'
import { Invoice } from '../../types/invoice'

export default function InvoiceList() {
  const importExport = useImportExport('invoices')
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'none' | 'view'>('none')
  const [selected, setSelected] = useState<Invoice | null>(null)

  const { data, isLoading } = useInvoiceList(search)
  const deleteInvoice = useDeleteInvoice()

  const viewUuid = modal === 'view' && selected?.uuid ? selected.uuid : ''
  const { data: invoiceDetail, isLoading: isLoadingDetail } = useInvoice(viewUuid)

  const invoices = data?.items ?? []

  const viewInvoice = invoiceDetail?.data ?? selected

  const close = () => { setModal('none'); setSelected(null) }
  const fv = (label: string, val: unknown) => (<div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{label}</p><p className="text-slate-900 dark:text-slate-100">{String(val ?? '—')}</p></div>)

  const paymentBadge = (status: string) => {
    const variant = status === 'paid' ? 'success' : status === 'partial' ? 'warning' : 'neutral'
    return <Badge variant={variant}>{status}</Badge>
  }

  const columns: Column<Invoice>[] = [
    { key: 'invoiceCode', header: 'Invoice', sortable: true, render: r => <span className="font-mono text-xs text-slate-600 dark:text-slate-100">#{r.invoiceCode}</span> },
    { key: 'customerName', header: 'Customer', sortable: true, render: r => <div><p className="font-medium text-slate-900 dark:text-slate-100">{r.customerName ?? '—'}</p><p className="text-xs text-slate-400">{r.shopName}</p></div> },
    { key: 'orderCode', header: 'Order', render: r => <span className="text-sm text-slate-600 dark:text-slate-300">{r.orderCode ?? '—'}</span> },
    { key: 'finalTotal', header: 'Total', align: 'right', render: r => <span className="font-semibold">{r.finalTotal?.toFixed(2)}</span> },
    { key: 'paymentStatus', header: 'Payment', align: 'center', render: r => paymentBadge(r.paymentStatus) },
    { key: 'status', header: 'Status', align: 'center', render: r => <Badge variant={r.status === 1 ? 'success' : 'neutral'}>{r.status === 1 ? 'Active' : 'Inactive'}</Badge> },
    { key: 'invoiceDate', header: 'Date' },
    {
      key: 'actions', header: '', align: 'right', width: '90px', render: r => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); setSelected(r); setModal('view') }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); navigate(`/invoices/edit/${r.uuid}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); if (confirm('Delete invoice?')) deleteInvoice.mutate(r.uuid) }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ]

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-5 gap-4">
        <p className="text-sm text-slate-500">{invoices.length} invoices</p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 h-9 w-64 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-brand-400 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices…" className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none" />
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
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/invoices/add')}>Add Invoice</Button>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-slate-500">Loading...</div>
        ) : (
          <DataTable columns={columns} data={invoices} keyField="uuid" onRowClick={r => { setSelected(r); setModal('view') }} emptyMessage="No invoices found." />
        )}
      </div>
      <SlidePanel width="full" isOpen={modal === 'view'} onClose={close} title={`Invoice #${selected?.invoiceCode ?? ''}`} subtitle={selected?.invoiceDate}
        footer={<div className="flex items-center gap-3 ml-auto"><Button variant="outline" onClick={close}>Close</Button><Button icon={<Pencil className="w-4 h-4" />} onClick={() => { if (selected) navigate(`/invoices/edit/${selected.uuid}`) }}>Edit</Button></div>}>
        {isLoadingDetail ? (
          <div className="flex items-center justify-center h-48 text-slate-500">Loading invoice details…</div>
        ) : viewInvoice && (
          <div className="space-y-6">
            {/* Header card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                    {viewInvoice.customer ? `${viewInvoice.customer.firstName} ${viewInvoice.customer.lastName}` : (viewInvoice.customerName ?? '—')}
                  </p>
                  <p className="text-sm text-slate-400">{viewInvoice.customer?.shopName ?? viewInvoice.shopName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {paymentBadge(viewInvoice.paymentStatus)}
                  <Badge variant={viewInvoice.status === 1 ? 'success' : 'neutral'}>{viewInvoice.status === 1 ? 'Active' : 'Inactive'}</Badge>
                </div>
              </div>
            </div>

            {/* Invoice info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {fv('Invoice Code', viewInvoice.invoiceCode)}
              {fv('Date', viewInvoice.invoiceDate)}
              {fv('Due Date', viewInvoice.dueDate)}
              {fv('Order', viewInvoice.orderCode ?? '—')}
              {fv('Delivery', viewInvoice.deliveryCode ?? '—')}
              {fv('Status', viewInvoice.currentStatus ?? '—')}
              {fv('Paid Amount', viewInvoice.paidAmount?.toFixed(2) ?? '0.00')}
              {fv('Reference', viewInvoice.reference ?? '—')}
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Items</p>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
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
                    {(viewInvoice.invoiceItems ?? viewInvoice.items ?? []).map((item: any, i: number) => (
                      <tr key={item.id ?? i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100">
                          <p>{item.item?.name ?? item.itemName ?? `Item ${item.itemId}`}</p>
                          {item.uomName && <p className="text-xs text-slate-400">{item.uomName}</p>}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300">{item.price?.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300">{item.discount?.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">{item.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                    {(viewInvoice.invoiceItems ?? viewInvoice.items ?? []).length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-xs">No items</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300"><span>Gross Total</span><span>{viewInvoice.grossTotal?.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300"><span>Tax</span><span>{viewInvoice.totalTax?.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300"><span>Rounding</span><span>{viewInvoice.rounding?.toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-bold text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700 pt-2"><span>Net Total</span><span>{viewInvoice.finalTotal?.toFixed(2)}</span></div>
              </div>
            </div>

            {viewInvoice.customerNote && (
              <div>{fv('Customer Note', viewInvoice.customerNote)}</div>
            )}
          </div>
        )}
      </SlidePanel>
    </PageLayout>
  )
}
