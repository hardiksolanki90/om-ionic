import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import { Map } from 'lucide-react'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { StatusSwitch } from '../../components/ui/StatusSwitch'
import { PageLayout } from '../../layouts/PageLayout'
import { useRoute, useCreateRoute, useUpdateRoute } from '../../hooks/useRoutes'
import type { RouteForm as RouteFormType } from '../../types/route'
import { AreaPickerModal } from '../../components/AreaPickerModal'
import { CodeSettingsModal } from '../../components/ui/CodeSettingsModal'
import { useCodePreview, useCodeSettings } from '../../hooks/useCodeSetting'

const EMPTY: RouteFormType = { code: '', name: '', areaId: '', areaName: '', status: 1 }

export default function RouteForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [present] = useIonToast()

  const { data, isLoading } = useRoute(isEdit ? id! : '')
  const createRoute = useCreateRoute()
  const updateRoute = useUpdateRoute()

  const [form, setForm] = useState<RouteFormType>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [areaPickerOpen, setAreaPickerOpen] = useState(false)

  const { data: codeSettings } = useCodeSettings('route')
  const isAuto = codeSettings?.is_auto ?? false
  const { data: previewData } = useCodePreview('route', !isEdit && isAuto)

  useEffect(() => {
    if (!isEdit && isAuto && previewData?.code) {
      setForm(f => ({ ...f, code: previewData.code || '' }))
    }
  }, [isEdit, isAuto, previewData])

  useEffect(() => {
    if (isEdit && data?.item) {
      const r = data.item
      setForm({
        code: r.code ?? '',
        name: r.name ?? '',
        areaId: r.areaId ?? '',
        areaName: r.areaName ?? '',
        status: r.status ?? 1,
      })
    }
  }, [data, isEdit])

  const set = (k: keyof RouteFormType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name || !form.code) {
      present({ message: 'Name and code are required.', duration: 2500, position: 'top', color: 'danger' })
      return
    }
    if (!form.areaId) {
      present({ message: 'Area is required.', duration: 2500, position: 'top', color: 'danger' })
      return
    }
    setSaving(true)
    try {
      if (isEdit && data?.item?.uuid) {
        await updateRoute.mutateAsync({ uuid: data.item.uuid, data: form })
        present({ message: 'Route updated.', duration: 2500, position: 'top', color: 'success' })
      } else {
        await createRoute.mutateAsync(form)
        present({ message: 'Route created.', duration: 2500, position: 'top', color: 'success' })
      }
      navigate('/routes')
    } catch (err: any) {
      present({ message: err?.response?.data?.message || 'Failed to save route.', duration: 3000, position: 'top', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading route…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen
        onClose={() => navigate('/routes')}
        title={isEdit ? 'Edit Route' : 'New Route'}
        subtitle={isEdit ? 'Update route details' : 'Create a new route'}
        width="full"
        pageMode
        footer={
          <div className="flex items-center justify-between w-full">
            <StatusSwitch value={form.status === 1} onChange={v => setForm(f => ({ ...f, status: v ? 1 : 0 }))} />
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/routes')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saving...' : isEdit ? 'Update Route' : 'Create Route'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Map className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Route Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <Input
                label="Route Code"
                placeholder={isAuto ? 'Auto-generated' : 'e.g. RT-001'}
                value={(!isEdit && isAuto) ? (previewData?.code || 'Generating...') : form.code}
                onChange={set('code')}
                disabled={!isEdit && isAuto}
                onSettingsClick={() => setSettingsOpen(true)}
              />
              <Input label="Route Name" required value={form.name} onChange={set('name')} placeholder="e.g. North District" />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Area <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAreaPickerOpen(true)}
                  className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-left text-slate-900 dark:text-slate-100 ring-1 ring-slate-300 dark:ring-slate-700"
                >
                  {form.areaName || <span className="text-slate-400 dark:text-slate-500">Select Area</span>}
                </button>
              </div>
            </div>
          </section>
        </div>
      </SlidePanel>

      <CodeSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} component="route" title="Route Code" />

      <AreaPickerModal
        isOpen={areaPickerOpen}
        onClose={() => setAreaPickerOpen(false)}
        selectedId={form.areaId ? Number(form.areaId) : undefined}
        onSelect={(id, name) => setForm(f => ({ ...f, areaId: id, areaName: name }))}
      />
    </PageLayout>
  )
}
