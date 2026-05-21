import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import { User, Briefcase } from 'lucide-react'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { StatusSwitch } from '../../components/ui/StatusSwitch'
import { PageLayout } from '../../layouts/PageLayout'
import { SearchSelect, SelectOption } from '../../components/ui/SearchSelect'
import { useSalesman, useCreateSalesman, useUpdateSalesman } from '../../hooks/useSalesman'
import { useRouteList } from '../../hooks/useRoutes'
import type { SalesmanForm as SalesmanFormType } from '../../types/salesman'

const EMPTY: SalesmanFormType = { firstName: '', lastName: '', code: '', email: '', username: '', password: '', mobile: '', salesmanType: 'Salesman', route: '' }

export default function SalesmanForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [present] = useIonToast()

  const { data, isLoading } = useSalesman(isEdit ? id : undefined)
  const createSalesman = useCreateSalesman()
  const updateSalesman = useUpdateSalesman()

  const { data: routeData } = useRouteList('', 1, 100)
  const routeOptions: SelectOption[] = (routeData?.items ?? []).map(r => ({ id: r.id.toString(), label: r.name }))

  const [form, setForm] = useState<SalesmanFormType>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && data?.item) {
      const s = data.item
      setForm({
        firstName: s.firstName ?? '',
        lastName: s.lastName ?? '',
        code: s.code ?? '',
        email: s.email ?? '',
        username: s.username ?? '',
        mobile: s.mobile ?? '',
        salesmanType: s.salesmanType ?? 'Salesman',
        route: s.route ?? '',
      })
    }
  }, [data, isEdit])

  const set = (k: keyof SalesmanFormType) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.firstName || !form.code || !form.username) {
      present({ message: 'First name, code, and username are required.', duration: 2500, position: 'top', color: 'danger' })
      return
    }
    setSaving(true)
    try {
      if (isEdit && data?.item?.uuid) {
        await updateSalesman.mutateAsync({ uuid: data.item.uuid, data: form })
        present({ message: 'Salesman updated.', duration: 2500, position: 'top', color: 'success' })
      } else {
        await createSalesman.mutateAsync(form)
        present({ message: 'Salesman created.', duration: 2500, position: 'top', color: 'success' })
      }
      navigate('/salesman')
    } catch (err: any) {
      present({ message: err?.response?.data?.message || 'Failed to save salesman.', duration: 3000, position: 'top', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading salesman…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen
        onClose={() => navigate('/salesman')}
        title={isEdit ? 'Edit Salesman' : 'New Salesman'}
        subtitle={isEdit ? 'Update salesman details' : 'Create a new salesman profile'}
        width="full"
        pageMode
        footer={
          <div className="flex items-center justify-between w-full">
            <div /> {/* Placeholder for status if we add it later */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/salesman')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saving...' : isEdit ? 'Update Salesman' : 'Create Salesman'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <User className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Personal Info</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Salesman Code" required value={form.code} onChange={set('code')} placeholder="e.g. SM-01" />
              <Input label="First Name" required value={form.firstName} onChange={set('firstName')} placeholder="e.g. John" />
              <Input label="Last Name" required value={form.lastName} onChange={set('lastName')} placeholder="e.g. Doe" />
              <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" />
              <Input label="Mobile" required value={form.mobile} onChange={set('mobile')} placeholder="+1 555-0123" />
            </div>
          </section>

          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Briefcase className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Account & Job Info</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Username" required value={form.username} onChange={set('username')} placeholder="e.g. johndoe" />
              {!isEdit && (
                <Input label="Password" required type="password" value={form.password} onChange={set('password')} placeholder="Set a secure password" />
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Salesman Type</label>
                <select
                  value={form.salesmanType}
                  onChange={set('salesmanType')}
                  className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Salesman">Salesman</option>
                  <option value="Merchandiser">Merchandiser</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
              <SearchSelect
                label="Assigned Route"
                value={form.route}
                displayValue={routeOptions.find(o => o.id === form.route)?.label || ''}
                onChange={(val) => setForm(f => ({ ...f, route: String(val) }))}
                options={routeOptions}
                placeholder="Select a route…"
              />
            </div>
          </section>
        </div>
      </SlidePanel>
    </PageLayout>
  )
}
