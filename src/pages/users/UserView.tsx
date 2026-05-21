import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Pencil } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageLayout } from '../../layouts/PageLayout'
import { useUser } from '../../hooks/useUsers'

export default function UserView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: routeData, isLoading } = useUser(id!)
  const selected = routeData?.item

  const initials = (u: any) => `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase()

  const fv = (label: string, value: unknown) => (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{label}</p>
      <p className="text-slate-900 dark:text-slate-100">{String(value ?? '—')}</p>
    </div>
  )

  if (isLoading || !selected) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Loading user details...</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="flex flex-col mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/users')}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">User Details</h1>
            </div>
          </div>
          <Button variant="outline" icon={<Pencil className="w-4 h-4" />} onClick={() => navigate(`/users/edit/${selected.uuid}`)}>Edit User</Button>
        </div>

        <div className="space-y-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-lg font-semibold text-brand-600">{initials(selected)}</div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{selected.firstName} {selected.lastName}</p>
              <p className="text-sm text-slate-500 mt-0.5">{selected.email}</p>
              <div className="mt-2"><Badge variant="info">{selected.roleName}</Badge></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {fv('First Name', selected.firstName)}
            {fv('Last Name', selected.lastName)}
            {fv('Mobile', selected.mobile)}
            {fv('Role', selected.roleName)}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
