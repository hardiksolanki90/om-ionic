import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { InvoiceItem, InvoiceForm as InvoiceFormType } from '../../types/invoice'
import { StatusSwitch } from '../../components/ui/StatusSwitch'
import { ItemPickerModal } from '../../components/ItemPickerModal'
import { CustomerPickerModal } from '../../components/CustomerPickerModal'
import { CodeSettingsModal } from '../../components/ui/CodeSettingsModal'
import { useInvoice, useCreateInvoice, useUpdateInvoice } from '../../hooks/useInvoices'
import { useCodeSettings, useCodePreview } from '../../hooks/useCodeSetting'
import { useIonToast } from '@ionic/react'
import { PageLayout } from '../../layouts/PageLayout'

const getEmptyForm = (): InvoiceFormType => ({
  reference: '', customerId: '', orderId: '', deliveryId: '', invoiceCode: '', invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  items: [
    {
      id: Date.now().toString(),
      itemName: '',
      quantity: 1,
      price: 0,
      discount: 0,
      discountType: 'percentage',
      tax: 0,
      net: 0,
      total: 0
    }
  ], customerNote: '', grossTotal: 0, totalDiscount: 0, netTotal: 0, totalTax: 0, totalQty: 0, rounding: 0, finalTotal: 0, status: 1 as 0 | 1,
  paymentStatus: 'pending' as 'pending' | 'partial' | 'paid',
  paymentMethod: '',
  paidAmount: 0,
})

type InvoiceTotals = Pick<InvoiceFormType, 'items' | 'grossTotal' | 'totalDiscount' | 'netTotal' | 'totalTax' | 'totalQty' | 'rounding' | 'finalTotal'>

const computeInvoiceTotals = (items: InvoiceItem[]): InvoiceTotals => {
  let grossTotal = 0
  let totalDiscount = 0
  let totalTax = 0
  let totalQty = 0

  const updatedItems = items.map(item => {
    const subtotal = item.quantity * item.price
    const discountAmount = item.discountType === 'percentage' ? subtotal * (item.discount / 100) : item.discount
    const netAmount = Math.max(0, subtotal - discountAmount)
    const taxAmount = netAmount * ((item.tax || 0) / 100)
    const total = netAmount + taxAmount

    grossTotal += subtotal
    totalDiscount += discountAmount
    totalTax += taxAmount
    totalQty += item.quantity

    return {
      ...item,
      net: parseFloat(netAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    }
  })

  const netTotal = parseFloat((grossTotal - totalDiscount).toFixed(2))
  const amountWithTax = parseFloat((netTotal + totalTax).toFixed(2))
  const finalTotal = Math.round(amountWithTax)
  const rounding = parseFloat((finalTotal - amountWithTax).toFixed(2))

  return {
    items: updatedItems,
    grossTotal: parseFloat(grossTotal.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    netTotal,
    totalTax: parseFloat(totalTax.toFixed(2)),
    totalQty,
    rounding,
    finalTotal,
  }
}

const toInvoicePayload = (form: InvoiceFormType): InvoiceFormType => ({
  ...form,
  totalDiscount: (form.grossTotal || 0) - (form.netTotal || 0),
  netTotal: form.finalTotal,
})

export default function InvoiceForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [present] = useIonToast()

  const { data, isLoading } = useInvoice(id ?? '')
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()

  const [form, setForm] = useState<InvoiceFormType>(getEmptyForm())
  const [openItemFor, setOpenItemFor] = useState<string | null>(null)
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { data: codeSettings } = useCodeSettings('invoice')
  const isAuto = codeSettings?.is_auto ?? false
  const { data: previewData } = useCodePreview('invoice', !isEdit && isAuto)

  useEffect(() => {
    if (isEdit && data?.data) {
      const inv = data.data
      const items = (inv.invoiceItems ?? inv.items ?? []).map((i: any) => ({
        id: String(i.id),
        itemId: i.itemId,
        itemName: i.item?.name ?? i.itemName ?? '',
        uomId: i.uomId ? Number(i.uomId) : undefined,
        uomName: i.uomName ?? '',
        availableUoms: (i.availableUoms ?? (i.uomId ? [{ id: Number(i.uomId), name: i.uomName ?? '' }] : [])),
        quantity: i.quantity ?? 0,
        price: i.price ?? 0,
        discount: i.discount ?? 0,
        discountType: (i.discountType ?? 'percentage') as 'percentage' | 'fixed',
        tax: i.taxAmount ?? i.tax ?? 0,
        net: i.net ?? 0,
        total: i.total ?? 0,
      }))
      const totals = computeInvoiceTotals(items)

      setForm({
        customerId: String(inv.customerId ?? ''),
        orderId: String(inv.orderId ?? ''),
        deliveryId: String(inv.deliveryId ?? ''),
        invoiceCode: inv.invoiceCode ?? '',
        invoiceDate: inv.invoiceDate ?? new Date().toISOString().slice(0, 10),
        dueDate: inv.dueDate ?? '',
        customerNote: inv.customerNote ?? '',
        reference: inv.reference ?? '',
        status: (inv.status ?? 1) as 0 | 1,
        paymentStatus: inv.paymentStatus ?? 'pending',
        paymentMethod: inv.paymentMethod ?? '',
        paidAmount: inv.paidAmount ?? 0,
        ...totals,
      })

      setCustomerName(inv.customer ? `${inv.customer.firstName} ${inv.customer.lastName}` : '')
    }
  }, [data, isEdit])

  useEffect(() => {
    if (!isEdit && isAuto && previewData?.code) {
      setForm(f => ({ ...f, invoiceCode: previewData.code || '' }))
    }
  }, [isEdit, isAuto, previewData])

  const onChange = (update: Partial<InvoiceFormType>) => setForm(f => ({ ...f, ...update }))
  const set = (k: keyof InvoiceFormType) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ [k]: e.target.value })

  const calculateTotals = (items: InvoiceItem[]) => {
    onChange(computeInvoiceTotals(items))
  }

  const addItem = () => {
    calculateTotals([...(form.items || []), {
      id: Date.now().toString(),
      itemId: undefined,
      itemName: '',
      quantity: 1,
      price: 0,
      discount: 0,
      discountType: 'percentage',
      tax: 0,
      net: 0,
      total: 0,
    }])
  }

  const removeItem = (index: number) => {
    const newItems = [...(form.items || [])]
    newItems.splice(index, 1)
    calculateTotals(newItems)
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...(form.items || [])]
      ; (newItems[index] as any)[field] = value
    calculateTotals(newItems)
  }

  const handleItemSelect = (rowId: string, itemId: number, name: string, price: number, tax: number, uoms: Array<{ id: number; name: string }>) => {
    const newItems = (form.items || []).map(item =>
      item.id === rowId ? { ...item, itemId, itemName: name, price, tax, availableUoms: uoms, uomId: uoms[0]?.id, uomName: uoms[0]?.name } : item
    )
    calculateTotals(newItems)
  }

  const handleSave = () => {
    const onError = (err: any) => present({ message: err?.response?.data?.message ?? 'Something went wrong', duration: 3000, color: 'danger' })
    const payload = toInvoicePayload(form)

    if (isEdit && id) {
      updateInvoice.mutate(
        { uuid: id, data: payload },
        {
          onSuccess: () => {
            present({ message: 'Invoice updated', duration: 2000, color: 'success' })
            navigate('/invoices')
          },
          onError
        }
      )
    } else {
      createInvoice.mutate(
        payload,
        {
          onSuccess: () => {
            present({ message: 'Invoice created', duration: 2000, color: 'success' })
            navigate('/invoices')
          },
          onError
        }
      )
    }
  }

  const activeRow = openItemFor ? (form.items || []).find(i => i.id === openItemFor) : null
  const saving = createInvoice.isPending || updateInvoice.isPending

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading Invoice...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen={true}
        onClose={() => navigate('/invoices')}
        title={isEdit ? 'Edit Invoice' : 'New Invoice'}
        width="full"
        pageMode
        footer={
          <div className="w-full flex items-center justify-between">
            <StatusSwitch
              value={form.status === 1}
              onChange={v => onChange({ status: v ? 1 : 0 })}
            />
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/invoices')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          {/* Top details block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Customer</label>
              <button
                type="button"
                onClick={() => setCustomerPickerOpen(true)}
                className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-left text-slate-900 dark:text-slate-100 ring-1 ring-slate-300 dark:ring-slate-700"
              >
                {customerName || <span className="text-slate-400 dark:text-slate-500">Select Customer</span>}
              </button>
            </div>
            <Input
              label="Invoice Number"
              placeholder={isAuto ? 'Auto-generated' : 'INV-0000'}
              value={(!isEdit && isAuto) ? (previewData?.code || 'Generating...') : (form.invoiceCode || '')}
              onChange={set('invoiceCode')}
              disabled={!isEdit && isAuto}
              onSettingsClick={() => setSettingsOpen(true)}
            />
            <Input
              label="Order Reference"
              value={form.orderId || ''}
              onChange={set('orderId')}
              placeholder="Order ID"
            />
            <Input
              label="Delivery Reference"
              value={form.deliveryId || ''}
              onChange={set('deliveryId')}
              placeholder="Delivery ID"
            />
            <Input
              label="Invoice Date"
              type="date"
              value={form.invoiceDate}
              onChange={set('invoiceDate')}
            />
            <Input
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={set('dueDate')}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Status</label>
              <select
                className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 ring-1 ring-slate-300 dark:ring-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                value={form.paymentStatus}
                onChange={e => onChange({ paymentStatus: e.target.value as 'pending' | 'partial' | 'paid' })}
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <Input
              label="Paid Amount"
              type="number"
              value={form.paidAmount || 0}
              onChange={e => onChange({ paidAmount: Number(e.target.value) })}
            />
          </div>

          {/* Dynamic Items Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="px-3 py-3 min-w-[180px]">Item</th>
                    <th className="px-3 py-3 min-w-[100px]">UOM</th>
                    <th className="px-3 py-3 w-20">QTY</th>
                    <th className="px-3 py-3 w-20">Price</th>
                    <th className="px-3 py-3 min-w-[110px]">Discount</th>
                    <th className="px-3 py-3 w-20">Tax</th>
                    <th className="px-3 py-3 w-20">Net</th>
                    <th className="px-3 py-3 w-24">Total</th>
                    <th className="px-3 py-3 w-10 text-center">Act</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                  {(form.items || []).map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setOpenItemFor(item.id)}
                          className={cn(
                            'w-full h-8 rounded-md border px-2 text-xs text-left flex items-center justify-between gap-1',
                            'bg-white dark:bg-slate-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ring-1 ring-slate-300 dark:ring-slate-700',
                            item.itemName ? 'border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100' : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'
                          )}
                        >
                          <span className="truncate">{item.itemName || 'Select Item'}</span>
                          <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          className="w-full h-8 rounded-md border border-slate-300 dark:border-slate-600 px-2 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:text-slate-400 dark:disabled:text-slate-500"
                          value={item.uomId ?? ''}
                          disabled={!item.availableUoms?.length}
                          onChange={e => {
                            const selected = item.availableUoms?.find(u => u.id === Number(e.target.value))
                            updateItem(index, 'uomId', selected?.id)
                            updateItem(index, 'uomName', selected?.name ?? '')
                          }}
                        >
                          {!item.availableUoms?.length && <option value="">Select item first</option>}
                          {(item.availableUoms ?? []).map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" min="0"
                          className="w-full h-8 rounded-md border border-slate-300 dark:border-slate-600 px-2 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" readOnly
                          className="w-full h-8 rounded-md border-transparent px-2 text-xs bg-transparent text-slate-500 focus:outline-none"
                          value={item.price}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <input
                            type="number" min="0" step="0.01"
                            className="flex-1 h-8 rounded-md border border-slate-300 dark:border-slate-600 px-2 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-14"
                            value={item.discount || ''}
                            onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                          />
                          <select
                            className="w-9 h-8 rounded-md border border-slate-300 dark:border-slate-600 px-1 text-xs focus:outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            value={item.discountType}
                            onChange={(e) => updateItem(index, 'discountType', e.target.value)}
                          >
                            <option value="percentage">%</option>
                            <option value="fixed">₹</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs">
                        <div className="font-medium">{item.tax || 0}%</div>
                        <div className="text-[10px] text-slate-400">({((item.net || 0) * ((item.tax || 0) / 100)).toFixed(2)})</div>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" readOnly
                          className="w-full h-8 rounded-md border-transparent px-2 text-xs bg-transparent text-slate-500 focus:outline-none"
                          value={item.net}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" readOnly
                          className="w-full h-8 rounded-md border-transparent px-0 text-xs bg-transparent font-semibold text-brand-600 focus:outline-none"
                          value={item.total}
                        />
                      </td>
                      <td className="px-3 py-2 text-center text-red-500">
                        <button onClick={() => removeItem(index)} className="p-1.5 hover:bg-red-50 rounded-md transition-colors" title="Remove Item">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!form.items || form.items.length === 0) && (
                <div className="text-center py-6 text-slate-500 text-sm">No items added yet.</div>
              )}
              <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <Button icon={<Plus className="w-3.5 h-3.5" />} onClick={addItem} variant="outline" size="sm">Add Item</Button>
              </div>
            </div>
          </div>

          {/* Customer Note & Totals summary block */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Customer Note</label>
              <textarea
                className="w-full min-h-[160px] rounded-xl border border-slate-300 dark:border-slate-600 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="Enter notes here..."
                value={form.customerNote || ''}
                onChange={(e) => onChange({ customerNote: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">Invoice Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Gross Total</span>
                <span className="font-semibold text-slate-700">${(form.grossTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Discount</span>
                <span className="font-semibold text-red-500">-${(form.totalDiscount ?? (form.grossTotal || 0) - (form.netTotal || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Net Total</span>
                <span className="font-semibold text-slate-700">${(form.netTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax</span>
                <span className="font-semibold text-slate-700">+${(form.totalTax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Rounding</span>
                <span className="font-semibold text-slate-700">
                  {(form.rounding || 0) >= 0 ? '+' : ''}${(form.rounding || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3 mt-3">
                <span className="text-slate-800">Final Total</span>
                <span className="text-brand-600">${(form.finalTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <ItemPickerModal
          isOpen={openItemFor !== null}
          onClose={() => setOpenItemFor(null)}
          onSelect={(id, name, price, tax, uoms) => {
            if (openItemFor) handleItemSelect(openItemFor, id, name, price, tax, uoms)
            setOpenItemFor(null)
          }}
          selectedId={activeRow?.itemId}
        />

        <CustomerPickerModal
          isOpen={customerPickerOpen}
          onClose={() => setCustomerPickerOpen(false)}
          onSelect={(id, name) => {
            onChange({ customerId: String(id) })
            setCustomerName(name)
          }}
          selectedId={form.customerId ? Number(form.customerId) : undefined}
        />
      </SlidePanel>

      <CodeSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} component="invoice" title="Invoice Code" />
    </PageLayout>
  )
}
