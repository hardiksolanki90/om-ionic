import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import { ChevronDown, MapPin, X } from 'lucide-react'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { StatusSwitch } from '../../components/ui/StatusSwitch'
import { PageLayout } from '../../layouts/PageLayout'
import { useWarehouse, useCreateWarehouse, useUpdateWarehouse } from '../../hooks/useWarehouses'
import {
  isWarehouseActive,
  toWarehouseStatus,
  type WarehouseForm as WarehouseFormType,
} from '../../types/warehouse'
import { CodeSettingsModal } from '../../components/ui/CodeSettingsModal'
import { useCodePreview, useCodeSettings } from '../../hooks/useCodeSetting'
import { RoutePickerModal } from '../../components/RoutePickerModal'
import { cn } from '../../lib/cn'

const EMPTY: WarehouseFormType = { code: '', name: '', routeIds: [], address: '', status: 'active', details: [] }

type SelectedRoute = { id: string; name: string; code?: string }

export default function WarehouseForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [present] = useIonToast()

  const { data, isLoading } = useWarehouse(isEdit ? id : undefined)
  const createWarehouse = useCreateWarehouse()
  const updateWarehouse = useUpdateWarehouse()

  const [form, setForm] = useState<WarehouseFormType>(EMPTY)
  const [selectedRoutes, setSelectedRoutes] = useState<SelectedRoute[]>([])
  const [saving, setSaving] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [routePickerOpen, setRoutePickerOpen] = useState(false)

  const { data: codeSettings } = useCodeSettings('warehouse')
  const isAuto = codeSettings?.is_auto ?? false
  const { data: previewData } = useCodePreview('warehouse', !isEdit && isAuto)

  useEffect(() => {
    if (!isEdit && isAuto && previewData?.code) {
      setForm(f => ({ ...f, code: previewData.code || '' }))
    }
  }, [isEdit, isAuto, previewData])

  useEffect(() => {
    if (isEdit && data?.data) {
      const w = data.data
      const routes = w.routes ?? []
      setForm({
        code: w.code ?? '',
        name: w.name ?? '',
        address: w.address ?? '',
        routeIds: routes.map(r => r.id.toString()),
        status: isWarehouseActive(w.status) ? 'active' : 'inactive',
        details: w.details ?? [],
      })
      setSelectedRoutes(
        routes.map(r => ({
          id: r.id.toString(),
          name: r.name,
          code: r.code,
        }))
      )
    }
  }, [data, isEdit])

  const addRoute = (id: number, name: string) => {
    const idStr = id.toString()
    if (form.routeIds.includes(idStr)) {
      present({ message: 'Route already added.', duration: 2000, position: 'top', color: 'warning' })
      return
    }
    setForm(f => ({ ...f, routeIds: [...f.routeIds, idStr] }))
    setSelectedRoutes(prev => [...prev, { id: idStr, name }])
  }

  const removeRoute = (id: string) => {
    setForm(f => ({ ...f, routeIds: f.routeIds.filter(rid => rid !== id) }))
    setSelectedRoutes(prev => prev.filter(r => r.id !== id))
  }

  const set = (k: keyof WarehouseFormType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name || !form.code) {
      present({ message: 'Name and code are required.', duration: 2500, position: 'top', color: 'danger' })
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      routeIds: form.routeIds.map(id => Number(id)),
    }
    try {
      if (isEdit && data?.data?.uuid) {
        await updateWarehouse.mutateAsync({ uuid: data.data.uuid, data: payload })
        present({ message: 'Warehouse updated.', duration: 2500, position: 'top', color: 'success' })
      } else {
        await createWarehouse.mutateAsync(payload)
        present({ message: 'Warehouse created.', duration: 2500, position: 'top', color: 'success' })
      }
      navigate('/warehouses')
    } catch (err: any) {
      present({ message: err?.response?.data?.message || 'Failed to save warehouse.', duration: 3000, position: 'top', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading warehouse…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen
        onClose={() => navigate('/warehouses')}
        title={isEdit ? 'Edit Warehouse' : 'New Warehouse'}
        subtitle={isEdit ? 'Update warehouse details' : 'Create a new warehouse location'}
        width="full"
        pageMode
        footer={
          <div className="flex items-center justify-between w-full">
            <StatusSwitch
              value={isWarehouseActive(form.status)}
              onChange={v => setForm(f => ({ ...f, status: toWarehouseStatus(v) }))}
            />
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/warehouses')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saving...' : isEdit ? 'Update Warehouse' : 'Create Warehouse'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <MapPin className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Warehouse Info</h3>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <Input
                label="Warehouse Code"
                placeholder={isAuto ? 'Auto-generated' : 'e.g. WH-001'}
                value={(!isEdit && isAuto) ? (previewData?.code || 'Generating...') : form.code}
                onChange={set('code')}
                disabled={!isEdit && isAuto}
                onSettingsClick={() => setSettingsOpen(true)}
              />
              <Input label="Warehouse Name" required value={form.name} onChange={set('name')} placeholder="e.g. Main Distribution Center" />
              <Input label="Address" value={form.address} onChange={set('address')} placeholder="Full Address" />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Routes</label>
                <button
                  type="button"
                  onClick={() => setRoutePickerOpen(true)}
                  className={cn(
                    'h-9 w-full rounded-lg border px-3 text-sm text-left flex items-center justify-between',
                    'bg-white dark:bg-slate-900 transition-colors duration-150 ring-1 ring-slate-300 dark:ring-slate-700',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
                    'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                  )}
                >
                  <span className="text-slate-400 dark:text-slate-500">Select Route</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
                {selectedRoutes.length > 0 && (
                  <ul className="space-y-2">
                    {selectedRoutes.map(route => (
                      <li
                        key={route.id}
                        className="flex items-center justify-between gap-2 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm ring-1 ring-slate-300 dark:ring-slate-700"
                      >
                        <span className="text-slate-700 dark:text-slate-200 truncate">
                          {route.name}
                          {route.code ? (
                            <span className="text-slate-400 dark:text-slate-500 font-mono text-xs ml-1.5">
                              {route.code}
                            </span>
                          ) : null}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRoute(route.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
                          aria-label={`Remove ${route.name}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
      </SlidePanel>

      <CodeSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} component="warehouse" title="Warehouse Code" />

      <RoutePickerModal
        isOpen={routePickerOpen}
        onClose={() => setRoutePickerOpen(false)}
        onSelect={(id, name) => addRoute(id, name)}
      />
    </PageLayout>
  )
}
