import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Pencil } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageLayout } from '../../layouts/PageLayout'
import { useRole } from '../../hooks/useRoles'
import {
  PermissionMap, emptyPermissions, fullPermissions,
  countPermissions, MODULE_GROUPS, isFullAccess, ALL_ACTIONS,
} from '../../types/role-permissions'

export default function RoleView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: routeData, isLoading } = useRole(id!)
  const selected = routeData?.item

  function PermSummary({ perms }: { perms: PermissionMap }) {
    const safePerms = (perms && typeof perms === 'object' && !Array.isArray(perms)) ? perms : emptyPermissions()
    return (
      <div className="space-y-3">
        {MODULE_GROUPS.map(group => {
          const active = group.modules.filter(m =>
            ALL_ACTIONS.some(a => safePerms[m.key]?.[a])
          )
          if (!active.length) return null
          return (
            <div key={group.heading}>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                {group.heading}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {active.map(m => (
                  <span key={m.key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                    {m.label}
                    {isFullAccess(m, safePerms)
                      ? <span className="text-brand-500 font-semibold">·all</span>
                      : <span className="text-slate-400">
                        ·{ALL_ACTIONS.filter(a => safePerms[m.key]?.[a]).map(a => a[0]).join('')}
                      </span>
                    }
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoading || !selected) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Loading role details...</p>
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
              onClick={() => navigate('/roles')}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Role Details</h1>
            </div>
          </div>
          <Button variant="outline" icon={<Pencil className="w-4 h-4" />} onClick={() => navigate(`/roles/edit/${selected.uuid}`)}>Edit Role</Button>
        </div>

        <div className="space-y-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
          {/* Header card */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{selected.name}</p>
              <p className="text-sm text-slate-500 mt-0.5">{selected.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={selected.status === 1 ? 'success' : 'neutral'}>{selected.status === 1 ? 'Active' : 'Inactive'}</Badge>
              <span className="text-xs text-slate-400">{selected.usersCount} users</span>
            </div>
          </div>

          {/* Permission count */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Permissions granted:</span>
            <span className="text-sm font-bold text-brand-600">{countPermissions(selected.permissions)}</span>
          </div>

          {/* Permission summary */}
          <PermSummary perms={selected.permissions} />
        </div>
      </div>
    </PageLayout>
  )
}
