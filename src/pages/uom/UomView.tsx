import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Pencil } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageLayout } from '../../layouts/PageLayout'
import { useUom } from '../../hooks/useUoms'

export default function UomView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: routeData, isLoading } = useUom(id!)
  const selected = routeData?.item

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
          <p className="text-slate-500">Loading UOM details...</p>
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
              onClick={() => navigate('/uom')}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">UOM Details</h1>
            </div>
          </div>
          <Button variant="outline" icon={<Pencil className="w-4 h-4" />} onClick={() => navigate(`/uom/edit/${selected.uuid}`)}>Edit UOM</Button>
        </div>

        <div className="space-y-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{selected.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={selected.status === 'active' ? 'success' : 'neutral'}>{selected.status === 'active' ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {fv('Name', selected.name)}
            {fv('Code', selected.code)}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
