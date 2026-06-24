import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { DeliveryItem, DeliveryForm as DeliveryFormType } from '../../types/delivery'
import { ItemPickerModal } from '../../components/ItemPickerModal'
import { CustomerPickerModal } from '../../components/CustomerPickerModal'
import { WarehousePickerModal } from '../../components/WarehousePickerModal'
import { OrderPickerModal } from '../../components/OrderPickerModal'
import { CodeSettingsModal } from '../../components/ui/CodeSettingsModal'
import { useDelivery, useCreateDelivery, useUpdateDelivery } from '../../hooks/useDeliveries'
import { useCodeSettings, useCodePreview } from '../../hooks/useCodeSetting'
import { useIonToast } from '@ionic/react'
import { PageLayout } from '../../layouts/PageLayout'

const DELIVERY_TYPES = ['Credit', 'Cash', 'Depot']

const getEmptyForm = (): DeliveryFormType => ({
  deliveryType: 'Credit',
  customerId: '',
  customerLob: '',
  warehouseId: '',
  warehouseName: '',
  orderId: '',
  deliveryCode: '',
  deliveryDate: new Date().toISOString().slice(0, 10),
  deliveryTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
  items: [
    {
      id: Date.now().toString(),
      itemCode: '',
      itemName: '',
      quantity: 1,
      price: 0,
      reason: '',
      excise: 0,
      discount: 0,
      discountType: 'percentage',
      tax: 0,
      net: 0,
      total: 0,
    }
  ],
  customerNote: '',
  grossTotal: 0,
  totalDiscount: 0,
  totalExcise: 0,
  netTotal: 0,
  totalTax: 0,
  totalQty: 0,
  rounding: 0,
  finalTotal: 0,
  reference: '',
  status: 1 as 0 | 1,
})

const computeDeliveryTotals = (items: DeliveryItem[]) => {
  let grossTotal = 0
  let totalDiscount = 0
  let totalTax = 0
  let totalExcise = 0
  let totalQty = 0

  const updatedItems = items.map(item => {
    const subtotal = item.quantity * item.price
    const discountAmount = item.discountType === 'percentage' ? subtotal * (item.discount / 100) : item.discount
    const netAmount = Math.max(0, subtotal - discountAmount)
    const exciseAmount = item.excise || 0
    const taxAmount = netAmount * ((item.tax || 0) / 100)
    const total = netAmount + exciseAmount + taxAmount

    grossTotal += subtotal
    totalDiscount += discountAmount
    totalExcise += exciseAmount
    totalTax += taxAmount
    totalQty += item.quantity

    return {
      ...item,
      net: parseFloat(netAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    }
  })

  const netTotal = parseFloat((grossTotal - totalDiscount).toFixed(2))
  const amountWithTax = parseFloat((netTotal + totalExcise + totalTax).toFixed(2))
  const finalTotal = Math.round(amountWithTax)
  const rounding = parseFloat((finalTotal - amountWithTax).toFixed(2))

  return {
    items: updatedItems,
    grossTotal: parseFloat(grossTotal.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    totalExcise: parseFloat(totalExcise.toFixed(2)),
    netTotal,
    totalTax: parseFloat(totalTax.toFixed(2)),
    totalQty,
    rounding,
    finalTotal,
  }
}

const toDeliveryPayload = (form: DeliveryFormType) => ({
  ...form,
  totalDiscount: (form.grossTotal || 0) - (form.netTotal || 0),
  netTotal: form.finalTotal,
})

export default function DeliveryForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [present] = useIonToast()

  const { data, isLoading } = useDelivery(id ?? '')
  const createDelivery = useCreateDelivery()
  const updateDelivery = useUpdateDelivery()

  const [form, setForm] = useState<DeliveryFormType>(getEmptyForm())
  const [openItemFor, setOpenItemFor] = useState<string | null>(null)
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false)
  const [warehousePickerOpen, setWarehousePickerOpen] = useState(false)
  const [orderPickerOpen, setOrderPickerOpen] = useState(false)
  const [orderCode, setOrderCode] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { data: codeSettings } = useCodeSettings('delivery')
  const isAuto = codeSettings?.is_auto ?? false
  const { data: previewData } = useCodePreview('delivery', !isEdit && isAuto)

  useEffect(() => {
    if (isEdit && data?.data) {
      const d = data.data
      const items = (d.deliveryItems ?? d.items ?? []).map((i: any) => ({
        id: String(i.id),
        itemId: i.itemId,
        itemCode: i.item?.code ?? i.itemCode ?? '',
        itemName: i.item?.name ?? i.itemName ?? '',
        uomId: i.uomId ? Number(i.uomId) : undefined,
        uomName: i.uomName ?? '',
        availableUoms: (i.availableUoms ?? (i.uomId ? [{ id: Number(i.uomId), name: i.uomName ?? '' }] : [])),
        quantity: i.quantity ?? 0,
        price: i.price ?? 0,
        reason: i.reason ?? '',
        excise: i.excise ?? 0,
        discount: i.discount ?? 0,
        discountType: (i.discountType ?? 'percentage') as 'percentage' | 'fixed',
        tax: i.taxAmount ?? i.tax ?? 0,
        net: i.net ?? 0,
        total: i.total ?? 0,
      }))
      const totals = computeDeliveryTotals(items)

      if (d.orderCode ?? d.order?.code) setOrderCode(d.orderCode ?? d.order?.code)
      setForm({
        deliveryType: d.deliveryType ?? 'Credit',
        customerId: String(d.customerId ?? ''),
        customerLob: d.customerLob ?? '',
        warehouseId: String(d.warehouseId ?? ''),
        warehouseName: d.warehouseName ?? '',
        orderId: String(d.orderId ?? d.order?.id ?? ''),
        deliveryCode: d.deliveryCode ?? '',
        deliveryDate: d.deliveryDate ?? new Date().toISOString().slice(0, 10),
        deliveryTime: d.deliveryTime ?? '',
        customerNote: d.customerNote ?? '',
        reference: d.reference ?? '',
        status: (d.status ?? 1) as 0 | 1,
        ...totals,
      })
    }
  }, [data, isEdit])

  useEffect(() => {
    if (!isEdit && isAuto && previewData?.code) {
      setForm(f => ({ ...f, deliveryCode: previewData.code || '' }))
    }
  }, [isEdit, isAuto, previewData])

  const onChange = (update: Partial<DeliveryFormType>) => setForm(f => ({ ...f, ...update }))

  const calculateTotals = (items: DeliveryItem[]) => {
    onChange(computeDeliveryTotals(items))
  }

  const addItem = () => {
    calculateTotals([...(form.items || []), {
      id: Date.now().toString(),
      itemId: undefined,
      itemCode: '',
      itemName: '',
      quantity: 1,
      price: 0,
      reason: '',
      excise: 0,
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

  const updateItem = (index: number, field: keyof DeliveryItem, value: any) => {
    const newItems = [...(form.items || [])]
    ;(newItems[index] as any)[field] = value
    calculateTotals(newItems)
  }

  const handleItemSelect = (rowId: string, itemId: number, name: string, price: number, tax: number, uoms: Array<{ id: number; name: string }>, code?: string) => {
    const newItems = (form.items || []).map(item =>
      item.id === rowId ? {
        ...item,
        itemId,
        itemCode: code ?? item.itemCode,
        itemName: name,
        price,
        tax,
        availableUoms: uoms,
        uomId: uoms[0]?.id,
        uomName: uoms[0]?.name,
      } : item
    )
    calculateTotals(newItems)
  }

  const handleSave = () => {
    const onError = (err: any) => present({ message: err?.response?.data?.message ?? 'Something went wrong', duration: 3000, color: 'danger' })
    const payload = toDeliveryPayload(form)

    if (isEdit && id) {
      updateDelivery.mutate(
        { uuid: id, data: payload },
        {
          onSuccess: () => {
            present({ message: 'Delivery updated', duration: 2000, color: 'success' })
            navigate('/deliveries')
          },
          onError
        }
      )
    } else {
      createDelivery.mutate(
        payload,
        {
          onSuccess: () => {
            present({ message: 'Delivery created', duration: 2000, color: 'success' })
            navigate('/deliveries')
          },
          onError
        }
      )
    }
  }

  const activeRow = openItemFor ? (form.items || []).find(i => i.id === openItemFor) : null
  const saving = createDelivery.isPending || updateDelivery.isPending

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading Delivery...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen={true}
        onClose={() => navigate('/deliveries')}
        title={isEdit ? 'Edit Delivery' : 'New Delivery'}
        width="full"
        pageMode
        footer={
          <div className="w-full flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-slate-800 hover:bg-slate-900 text-white px-8">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          {/* Top details block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left column */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Type</label>
                <select
                  className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 ring-1 ring-slate-300 dark:ring-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  value={form.deliveryType}
                  onChange={e => onChange({ deliveryType: e.target.value })}
                >
                  {DELIVERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Customer</label>
                <button
                  type="button"
                  onClick={() => setCustomerPickerOpen(true)}
                  className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-left text-slate-900 dark:text-slate-100 ring-1 ring-slate-300 dark:ring-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {form.customerId
                    ? <span>{form.customerLob || 'Selected Customer'}</span>
                    : <span className="text-slate-400 dark:text-slate-500">Select Customer</span>
                  }
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Warehouse</label>
                <button
                  type="button"
                  onClick={() => setWarehousePickerOpen(true)}
                  className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-left text-slate-900 dark:text-slate-100 ring-1 ring-slate-300 dark:ring-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {form.warehouseName
                    ? <span>{form.warehouseName}</span>
                    : <span className="text-slate-400 dark:text-slate-500">Select Warehouse</span>
                  }
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Order</label>
                <button
                  type="button"
                  onClick={() => setOrderPickerOpen(true)}
                  className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-left text-slate-900 dark:text-slate-100 ring-1 ring-slate-300 dark:ring-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {form.orderId
                    ? <span>{orderCode || `Order #${form.orderId}`}</span>
                    : <span className="text-slate-400 dark:text-slate-500">Select Order</span>
                  }
                </button>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <Input
                label="Delivery Number"
                placeholder={isAuto ? 'Auto-generated' : 'DLV-0000'}
                value={(!isEdit && isAuto) ? (previewData?.code || 'Generating...') : form.deliveryCode}
                onChange={e => onChange({ deliveryCode: e.target.value })}
                disabled={!isEdit && isAuto}
                onSettingsClick={() => setSettingsOpen(true)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Date</label>
                <input
                  type="date"
                  className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 ring-1 ring-slate-300 dark:ring-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  value={form.deliveryDate}
                  onChange={e => onChange({ deliveryDate: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Time</label>
                <input
                  type="time"
                  className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 ring-1 ring-slate-300 dark:ring-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  value={form.deliveryTime}
                  onChange={e => onChange({ deliveryTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Items Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="px-3 py-3 w-10 text-center">#</th>
                    <th className="px-3 py-3 min-w-[200px]">ITEM</th>
                    <th className="px-3 py-3 min-w-[80px]">UOM</th>
                    <th className="px-3 py-3 w-20">QUANTITY</th>
                    <th className="px-3 py-3 min-w-[140px]">REASON</th>
                    <th className="px-3 py-3 w-20">PRICE</th>
                    <th className="px-3 py-3 min-w-[110px]">DISCOUNT</th>
                    <th className="px-3 py-3 w-20">TAX</th>
                    <th className="px-3 py-3 w-24">NET</th>
                    <th className="px-3 py-3 w-24">TOTAL</th>
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                  {(form.items || []).map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-3 py-2 text-center text-slate-500 text-xs">{index + 1}</td>
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
                          {!item.availableUoms?.length && <option value="">-</option>}
                          {(item.availableUoms ?? []).map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" min="0" step="1"
                          className="w-full h-8 rounded-md border border-slate-300 dark:border-slate-600 px-2 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full h-8 rounded-md border border-slate-300 dark:border-slate-600 px-2 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          value={item.reason || ''}
                          onChange={(e) => updateItem(index, 'reason', e.target.value)}
                          placeholder="Search an reason"
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Customer Note</label>
              <textarea
                className="w-full min-h-[200px] rounded-xl border border-slate-300 dark:border-slate-600 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="Enter customer notes..."
                value={form.customerNote || ''}
                onChange={(e) => onChange({ customerNote: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Total</span>
                <span className="font-medium text-slate-700">{(form.grossTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Discount</span>
                <span className="font-medium text-slate-700">{(form.totalDiscount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Total</span>
                <span className="font-medium text-slate-700">{(form.netTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Excise</span>
                <span className="font-medium text-slate-700">{(form.totalExcise || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vat</span>
                <span className="font-medium text-slate-700">{(form.totalTax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span className="font-bold italic text-slate-800 dark:text-slate-100">Total</span>
                <span className="font-bold italic text-slate-800 dark:text-slate-100">{(form.finalTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <ItemPickerModal
          isOpen={openItemFor !== null}
          onClose={() => setOpenItemFor(null)}
          onSelect={(id, name, price, tax, uoms, code) => {
            if (openItemFor) handleItemSelect(openItemFor, id, name, price, tax, uoms, code)
            setOpenItemFor(null)
          }}
          selectedId={activeRow?.itemId}
        />

        <CustomerPickerModal
          isOpen={customerPickerOpen}
          onClose={() => setCustomerPickerOpen(false)}
          onSelect={(id, name, extra) => {
            onChange({
              customerId: String(id),
              customerLob: extra?.shopName ?? name,
            })
          }}
          selectedId={form.customerId ? Number(form.customerId) : undefined}
        />

        <WarehousePickerModal
          isOpen={warehousePickerOpen}
          onClose={() => setWarehousePickerOpen(false)}
          onSelect={(id: number, name: string) => {
            onChange({ warehouseId: String(id), warehouseName: name })
          }}
          selectedId={form.warehouseId ? Number(form.warehouseId) : undefined}
        />

        <OrderPickerModal
          isOpen={orderPickerOpen}
          onClose={() => setOrderPickerOpen(false)}
          onSelect={(id: number, code: string) => {
            onChange({ orderId: String(id) })
            setOrderCode(code)
          }}
          selectedId={form.orderId ? Number(form.orderId) : undefined}
        />
      </SlidePanel>

      <CodeSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} component="delivery" title="Delivery Code" />
    </PageLayout>
  )
}
