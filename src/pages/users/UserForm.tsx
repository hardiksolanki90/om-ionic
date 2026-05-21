import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import { User, Shield } from 'lucide-react'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { PageLayout } from '../../layouts/PageLayout'
import { SearchSelect, SelectOption } from '../../components/ui/SearchSelect'
import { useUser, useCreateUser, useUpdateUser } from '../../hooks/useUsers'
import { useRoleList } from '../../hooks/useRoles'
import type { UserForm as UserFormType } from '../../types/user'

const EMPTY: UserFormType = { firstName: '', lastName: '', email: '', mobile: '', password: '', roleId: '', roleName: '' }

export default function UserForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [present] = useIonToast()

  const { data, isLoading } = useUser(isEdit ? id : undefined)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const { data: rolesData } = useRoleList('', 1, 100)
  const roleOptions: SelectOption[] = (rolesData?.items ?? rolesData?.roles ?? []).map(r => ({ id: r.id.toString(), label: r.name }))

  const [form, setForm] = useState<UserFormType>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && data?.item) {
      const u = data.item
      setForm({
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        email: u.email ?? '',
        mobile: u.mobile ?? '',
        roleId: u.roleId?.toString() ?? '',
        roleName: u.roleName ?? '',
      })
    }
  }, [data, isEdit])

  const set = (k: keyof UserFormType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.firstName || !form.email || !form.roleId) {
      present({ message: 'First name, email, and role are required.', duration: 2500, position: 'top', color: 'danger' })
      return
    }
    setSaving(true)
    try {
      if (isEdit && data?.item?.uuid) {
        await updateUser.mutateAsync({ uuid: data.item.uuid, data: form })
        present({ message: 'User updated.', duration: 2500, position: 'top', color: 'success' })
      } else {
        await createUser.mutateAsync(form)
        present({ message: 'User created.', duration: 2500, position: 'top', color: 'success' })
      }
      navigate('/users')
    } catch (err: any) {
      present({ message: err?.response?.data?.message || 'Failed to save user.', duration: 3000, position: 'top', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading user...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen
        onClose={() => navigate('/users')}
        title={isEdit ? 'Edit User' : 'Add User'}
        subtitle={isEdit ? 'Update user details' : 'Create a new user account'}
        width="full"
        pageMode
        footer={
          <div className="flex items-center justify-between w-full">
            <div />
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/users')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}</Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 pb-10">
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-700/60 pb-2">
              <User className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Personal Info</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" required value={form.firstName} onChange={set('firstName')} placeholder="e.g. Alex" />
              <Input label="Last Name" required value={form.lastName} onChange={set('lastName')} placeholder="e.g. Morgan" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email" required type="email" value={form.email} onChange={set('email')} placeholder="user@orderflow.com" />
              <Input label="Mobile" required value={form.mobile} onChange={set('mobile')} placeholder="+1 555-0000" />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-700/60 pb-2">
              <Shield className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Account Settings</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SearchSelect
                label="Role"
                required
                value={form.roleId}
                displayValue={form.roleName || roleOptions.find(o => o.id === form.roleId)?.label || ''}
                onChange={(id, label) => setForm(f => ({ ...f, roleId: id, roleName: label }))}
                options={roleOptions}
                placeholder="Select role…"
              />
              {!isEdit && (
                <Input label="Password" required type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" />
              )}
            </div>
          </section>
        </div>
      </SlidePanel>
    </PageLayout>
  )
}
