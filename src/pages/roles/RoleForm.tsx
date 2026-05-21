import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import { Shield } from 'lucide-react'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input, Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { StatusSwitch } from '../../components/ui/StatusSwitch'
import { PermissionMatrix } from '../../components/ui/PermissionMatrix'
import { PageLayout } from '../../layouts/PageLayout'
import { useRole, useCreateRole, useUpdateRole } from '../../hooks/useRoles'
import type { RoleForm as RoleFormType } from '../../types/role'
import { emptyPermissions } from '../../types/role-permissions'

const EMPTY: RoleFormType = { name: '', description: '', usersCount: 0, status: 1, permissions: emptyPermissions() }

export default function RoleForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [present] = useIonToast()

  const { data, isLoading } = useRole(isEdit ? id : undefined)
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()

  const [form, setForm] = useState<RoleFormType>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && data?.item) {
      const r = data.item
      setForm({
        name: r.name ?? '',
        description: r.description ?? '',
        usersCount: r.usersCount ?? 0,
        status: r.status ?? 1,
        permissions: r.permissions ?? emptyPermissions(),
      })
    }
  }, [data, isEdit])

  const onChange = (field: keyof RoleFormType, value: any) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleSave = async () => {
    if (!form.name) {
      present({ message: 'Role name is required.', duration: 2500, position: 'top', color: 'danger' })
      return
    }
    setSaving(true)
    try {
      if (isEdit && data?.item?.uuid) {
        await updateRole.mutateAsync({ uuid: data.item.uuid, data: form })
        present({ message: 'Role updated.', duration: 2500, position: 'top', color: 'success' })
      } else {
        await createRole.mutateAsync(form)
        present({ message: 'Role created.', duration: 2500, position: 'top', color: 'success' })
      }
      navigate('/roles')
    } catch (err: any) {
      present({ message: err?.response?.data?.message || 'Failed to save role.', duration: 3000, position: 'top', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading role…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen
        onClose={() => navigate('/roles')}
        title={isEdit ? `Edit Role — ${form.name}` : 'New Role'}
        subtitle={isEdit ? 'Update role details and permissions' : 'Set up a new role with specific permissions'}
        width="full"
        pageMode
        footer={
          <div className="flex items-center justify-between w-full">
            <StatusSwitch value={form.status === 1} onChange={v => onChange('status', v ? 1 : 0)} />
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/roles')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saving...' : isEdit ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Shield className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Role Details</h3>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <Input label="Role Name" required placeholder="e.g. Warehouse Manager" value={form.name} onChange={e => onChange('name', e.target.value)} />
              <Textarea label="Description" placeholder="What can this role do?" rows={2} value={form.description} onChange={e => onChange('description', e.target.value)} />
            </div>
          </section>
          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Shield className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Permissions</h3>
            </div>
            <PermissionMatrix value={form.permissions} onChange={perms => onChange('permissions', perms)} />
          </section>
        </div>
      </SlidePanel>
    </PageLayout>
  )
}
