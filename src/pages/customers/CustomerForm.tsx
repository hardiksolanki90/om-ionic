import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Store, UserCircle } from 'lucide-react'
import { useIonToast } from '@ionic/react'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { StatusSwitch } from '../../components/ui/StatusSwitch'
import { SalesmanPickerModal } from '../../components/SalesmanPickerModal'
import { CodeSettingsModal } from '../../components/ui/CodeSettingsModal'
import { useCodePreview, useCodeSettings } from '../../hooks/useCodeSetting'
import { PageLayout } from '../../layouts/PageLayout'
import { useCustomer, useCreateCustomer, useUpdateCustomer } from '../../hooks/useCustomers'
import type { CustomerFormData } from '../../types/customer'

const EMPTY: CustomerFormData = {
  customerCode: '', shopName: '', firstName: '', lastName: '',
  address: '', mobile: '', idSalesman: '', status: 1,
}

export default function CustomerForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [present] = useIonToast()

  const { data, isLoading } = useCustomer(isEdit ? id! : '')
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const [form, setForm] = useState<CustomerFormData>(EMPTY)
  const [salesmanPickerOpen, setSalesmanPickerOpen] = useState(false)
  const [salesmanName, setSalesmanName] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const { data: codeSettings } = useCodeSettings('customer')
  const isAuto = codeSettings?.is_auto ?? false
  const { data: previewData } = useCodePreview('customer', !isEdit && isAuto)

  useEffect(() => {
    if (!isEdit && isAuto && previewData?.code) {
      setForm(f => ({ ...f, customerCode: previewData.code || '' }))
    }
  }, [isEdit, isAuto, previewData])

  useEffect(() => {
    if (isEdit && data?.item) {
      const c = data.item
      setForm({
        customerCode: c.customerCode ?? '',
        shopName: c.shopName ?? '',
        firstName: c.firstName ?? '',
        lastName: c.lastName ?? '',
        address: c.address ?? '',
        mobile: c.mobile ?? '',
        idSalesman: c.idSalesman ?? '',
        status: typeof c.status === 'boolean' ? (c.status ? 1 : 0) : (c.status ?? 1),
      })
      setSalesmanName((c as any).salesmanName ?? '')
    }
  }, [data, isEdit])

  const set = (field: keyof CustomerFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSave = async () => {
    if (!form.shopName) {
      present({ message: 'Shop name is required.', duration: 2500, position: 'top', color: 'danger' })
      return
    }
    setSaving(true)
    try {
      if (isEdit && data?.item?.uuid) {
        await updateCustomer.mutateAsync({ uuid: data.item.uuid, data: form })
        present({ message: 'Customer updated.', duration: 2500, position: 'top', color: 'success' })
      } else {
        await createCustomer.mutateAsync(form)
        present({ message: 'Customer created.', duration: 2500, position: 'top', color: 'success' })
      }
      navigate('/customers')
    } catch (err: any) {
      present({ message: err?.response?.data?.message || 'Failed to save customer.', duration: 3000, position: 'top', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading customer…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen
        onClose={() => navigate('/customers')}
        title={isEdit ? 'Edit Customer' : 'New Customer'}
        subtitle={isEdit ? 'Update customer information' : 'Create a new customer record'}
        width="full"
        pageMode
        footer={
          <div className="flex items-center justify-between w-full">
            <StatusSwitch value={form.status === 1} onChange={v => setForm(f => ({ ...f, status: v ? 1 : 0 }))} />
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/customers')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Store className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Shop & Account Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Customer Code"
                placeholder={isAuto ? 'Auto-generated' : 'CUST-000001'}
                value={(!isEdit && isAuto) ? (previewData?.code || 'Generating...') : form.customerCode}
                onChange={set('customerCode')}
                disabled={!isEdit && isAuto}
                onSettingsClick={() => setSettingsOpen(true)}
              />
              <Input label="Shop Name" placeholder="Shop Name" value={form.shopName} onChange={set('shopName')} required />
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Salesman</label>
                <button
                  type="button"
                  onClick={() => setSalesmanPickerOpen(true)}
                  className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-left text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {salesmanName || <span className="text-slate-400 dark:text-slate-500">Select Salesman</span>}
                </button>
              </div>
            </div>
          </section>

          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <UserCircle className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="First Name" placeholder="First Name" value={form.firstName} onChange={set('firstName')} />
              <Input label="Last Name" placeholder="Last Name" value={form.lastName} onChange={set('lastName')} />
              <Input label="Mobile" placeholder="Mobile Number" value={form.mobile} onChange={set('mobile')} />
              <div className="sm:col-span-2">
                <Input label="Address" placeholder="Full Address" value={form.address} onChange={set('address')} />
              </div>
            </div>
          </section>
        </div>

        <SalesmanPickerModal
          isOpen={salesmanPickerOpen}
          onClose={() => setSalesmanPickerOpen(false)}
          onSelect={(id, name) => { setForm(f => ({ ...f, idSalesman: id })); setSalesmanName(name) }}
          selectedId={form.idSalesman ? Number(form.idSalesman) : undefined}
        />
      </SlidePanel>

      <CodeSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} component="customer" title="Customer Code" />
    </PageLayout>
  )
}
