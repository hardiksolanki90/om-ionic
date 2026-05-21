import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import { Info } from 'lucide-react'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { StatusSwitch } from '../../components/ui/StatusSwitch'
import { PageLayout } from '../../layouts/PageLayout'
import { useBrand, useCreateBrand, useUpdateBrand } from '../../hooks/useBrands'
import type { BrandForm as BrandFormType } from '../../types/brand'

const EMPTY: BrandFormType = { name: '', code: '', status: 'active' }

function toFormStatus(status: string | boolean | number | undefined): string {
  if (typeof status === 'boolean') {
    return status ? 'active' : 'inactive'
  }
  if (typeof status === 'number') {
    return status === 1 ? 'active' : 'inactive'
  }
  if (status === '1' || status === 'active') {
    return 'active'
  }
  if (status === '0' || status === 'inactive') {
    return 'inactive'
  }
  return typeof status === 'string' ? status : 'active'
}

export default function BrandForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [present] = useIonToast()

  const { data, isLoading } = useBrand(isEdit ? id! : '')
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()

  const [form, setForm] = useState<BrandFormType>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && data?.item) {
      const b = data.item
      setForm({ name: b.name ?? '', code: b.code ?? '', status: toFormStatus(b.status) })
    }
  }, [data, isEdit])

  const set = (k: keyof BrandFormType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name || !form.code) {
      present({ message: 'Name and code are required.', duration: 2500, position: 'top', color: 'danger' })
      return
    }
    setSaving(true)
    try {
      if (isEdit && data?.item?.uuid) {
        await updateBrand.mutateAsync({ uuid: data.item.uuid, data: form })
        present({ message: 'Brand updated.', duration: 2500, position: 'top', color: 'success' })
      } else {
        await createBrand.mutateAsync(form)
        present({ message: 'Brand created.', duration: 2500, position: 'top', color: 'success' })
      }
      navigate('/brands')
    } catch (err: any) {
      present({ message: err?.response?.data?.message || 'Failed to save brand.', duration: 3000, position: 'top', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading brand…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen
        onClose={() => navigate('/brands')}
        title={isEdit ? 'Edit Brand' : 'New Brand'}
        subtitle={isEdit ? 'Update brand details' : 'Create a new brand'}
        width="full"
        pageMode
        footer={
          <div className="flex items-center justify-between w-full">
            <StatusSwitch value={form.status === 'active'} onChange={v => setForm(f => ({ ...f, status: v ? 'active' : 'inactive' }))} />
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/brands')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saving...' : isEdit ? 'Update Brand' : 'Create Brand'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Info className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Brand Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <Input label="Brand Name" required value={form.name} onChange={set('name')} placeholder="e.g. TechPro" />
              <Input label="Brand Code" required value={form.code} onChange={set('code')} placeholder="e.g. TPRO" />
            </div>
          </section>
        </div>
      </SlidePanel>
    </PageLayout>
  )
}
