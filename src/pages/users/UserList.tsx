import { useState, useMemo } from 'react'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { DataTable, Column } from '../../components/ui/DataTable'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../../layouts/PageLayout'
import { User } from '../../types/user'


import { useUserList, useDeleteUser } from '../../hooks/useUsers'
export default function UserList() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { data, isLoading } = useUserList(search)
  const deleteUser = useDeleteUser()

  const users = data?.items ?? []



  const initials = (u: User) => `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase()

  const fv = (l: string, v: unknown) => (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{l}</p>
      <p className="text-slate-900 dark:text-slate-100">{String(v ?? '—')}</p>
    </div>
  )

  const columns: Column<User>[] = [
    {
      key: 'firstName', header: 'User', sortable: true,
      render: r => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-600 flex-shrink-0">{initials(r)}</div>
          <div><p className="font-medium text-slate-900 dark:text-slate-100">{r.firstName} {r.lastName}</p><p className="text-xs text-slate-400">{r.email}</p></div>
        </div>
      ),
    },
    { key: 'mobile', header: 'Mobile', render: r => <span className="font-mono text-sm">{r.mobile}</span> },
    { key: 'roleName', header: 'Role', render: r => <Badge variant="info">{r.roleName || '—'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', width: '90px',
      render: r => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); navigate(`/users/view/${r.uuid}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); navigate(`/users/edit/${r.uuid}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={e => { e.stopPropagation(); if (confirm('Delete user?')) deleteUser.mutate(r.uuid) }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ]

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-5 gap-4">
        <p className="text-sm text-slate-500">{users.length} users</p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 h-9 w-64 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-brand-400 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none" />
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/users/add')}>Add User</Button>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-slate-500">Loading...</div>
        ) : (
          <DataTable columns={columns} data={users} keyField="uuid" onRowClick={r => navigate(`/users/view/${r.uuid}`)} emptyMessage="No users found." />
        )}
      </div>

    </PageLayout>
  )
}
