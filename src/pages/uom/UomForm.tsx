import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import { Scale } from 'lucide-react'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { StatusSwitch } from '../../components/ui/StatusSwitch'
import { PageLayout } from '../../layouts/PageLayout'
import { useUom, useCreateUom, useUpdateUom } from '../../hooks/useUoms'
import type { UomForm as UomFormType } from '../../types/uom'

const EMPTY: UomFormType = { name: '', code: '', status: 'active' }

export default function UomForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [present] = useIonToast()

  const { data, isLoading } = useUom(isEdit ? id : undefined)
  const createUom = useCreateUom()
  const updateUom = useUpdateUom()

  const [form, setForm] = useState<UomFormType>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && data?.item) {
      const u = data.item
      setForm({ name: u.name ?? '', code: u.code ?? '', status: u.status ?? 'active' })
    }
  }, [data, isEdit])

  const set = (k: keyof UomFormType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name || !form.code) {
      present({ message: 'Name and code are required.', duration: 2500, position: 'top', color: 'danger' })
      return
    }
    setSaving(true)
    try {
      if (isEdit && data?.item?.uuid) {
        await updateUom.mutateAsync({ uuid: data.item.uuid, data: form })
        present({ message: 'UOM updated.', duration: 2500, position: 'top', color: 'success' })
      } else {
        await createUom.mutateAsync(form)
        present({ message: 'UOM created.', duration: 2500, position: 'top', color: 'success' })
      }
      navigate('/uom')
    } catch (err: any) {
      present({ message: err?.response?.data?.message || 'Failed to save UOM.', duration: 3000, position: 'top', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading UOM…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen
        onClose={() => navigate('/uom')}
        title={isEdit ? 'Edit UOM' : 'New UOM'}
        subtitle={isEdit ? 'Update unit of measure details' : 'Create a new unit of measure'}
        width="full"
        pageMode
        footer={
          <div className="flex items-center justify-between w-full">
            <StatusSwitch value={form.status === 'active'} onChange={v => setForm(f => ({ ...f, status: v ? 'active' : 'inactive' }))} />
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/uom')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saving...' : isEdit ? 'Update UOM' : 'Create UOM'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Scale className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Unit of Measure Info</h3>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <Input label="UOM Name" required value={form.name} onChange={set('name')} placeholder="e.g. Piece" />
              <Input label="UOM Code" required value={form.code} onChange={set('code')} placeholder="e.g. PCS" />
            </div>
          </section>
        </div>
      </SlidePanel>
    </PageLayout>
  )
}
