import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import { MapPin } from 'lucide-react'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { StatusSwitch } from '../../components/ui/StatusSwitch'
import { PageLayout } from '../../layouts/PageLayout'
import { CodeSettingsModal } from '../../components/ui/CodeSettingsModal'
import { useCodeSettings, useCodePreview } from '../../hooks/useCodeSetting'
import { useArea, useCreateArea, useUpdateArea } from '../../hooks/useAreas'
import { isAreaActive, type AreaForm as AreaFormType } from '../../types/area'

const EMPTY: AreaFormType = { code: '', name: '', status: true }

export default function AreaForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [present] = useIonToast()

  const { data, isLoading } = useArea(isEdit ? id! : '')
  const createArea = useCreateArea()
  const updateArea = useUpdateArea()

  const [form, setForm] = useState<AreaFormType>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { data: codeSettings } = useCodeSettings('area')
  const isAuto = codeSettings?.is_auto

  const { data: previewData } = useCodePreview('area', !isEdit && isAuto)

  useEffect(() => {
    if (!isEdit && isAuto && previewData?.code) {
      setForm(prev => ({ ...prev, code: previewData.code! }))
    }
  }, [isEdit, isAuto, previewData])

  useEffect(() => {
    if (isEdit && data?.item) {
      const a = data.item
      setForm({
        code: a.code ?? '',
        name: a.name ?? '',
        status: isAreaActive(a.status),
      })
    }
  }, [data, isEdit])

  const set = (k: keyof AreaFormType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name || (!isAuto && !form.code)) {
      present({ message: 'Name and code are required.', duration: 2500, position: 'top', color: 'danger' })
      return
    }
    setSaving(true)
    try {
      if (isEdit && data?.item?.uuid) {
        await updateArea.mutateAsync({ uuid: data.item.uuid, data: form })
        present({ message: 'Area updated.', duration: 2500, position: 'top', color: 'success' })
      } else {
        await createArea.mutateAsync(form)
        present({ message: 'Area created.', duration: 2500, position: 'top', color: 'success' })
      }
      navigate('/areas')
    } catch (err: any) {
      present({ message: err?.response?.data?.message || 'Failed to save area.', duration: 3000, position: 'top', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading area…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen
        onClose={() => navigate('/areas')}
        title={isEdit ? 'Edit Area' : 'New Area'}
        subtitle={isEdit ? 'Update area details' : 'Create a new area'}
        width="full"
        pageMode
        footer={
          <div className="flex items-center justify-between w-full">
            <StatusSwitch value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} />
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/areas')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saving...' : isEdit ? 'Update Area' : 'Create Area'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <MapPin className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Area Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <Input
                label="Area Code"
                required={!isAuto}
                placeholder={isAuto ? 'Auto-generated' : 'e.g. AR-01'}
                value={(!isEdit && isAuto) ? (previewData?.code || 'Generating...') : form.code}
                onChange={set('code')}
                disabled={!isEdit && isAuto}
                onSettingsClick={() => setSettingsOpen(true)}
              />
              <Input label="Area Name" required value={form.name} onChange={set('name')} placeholder="e.g. North Austin" />
            </div>
          </section>
        </div>
      </SlidePanel>

      <CodeSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} component="area" title="Area Code" />
    </PageLayout>
  )
}
