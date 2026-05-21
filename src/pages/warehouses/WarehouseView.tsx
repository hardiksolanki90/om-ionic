import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Pencil } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PageLayout } from '../../layouts/PageLayout'
import { useWarehouse } from '../../hooks/useWarehouses'

export default function WarehouseView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: routeData, isLoading } = useWarehouse(id!)
  const selected = routeData?.data

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
          <p className="text-slate-500">Loading warehouse details...</p>
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
              onClick={() => navigate('/warehouses')}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Warehouse Details</h1>
            </div>
          </div>
          <Button variant="outline" icon={<Pencil className="w-4 h-4" />} onClick={() => navigate(`/warehouses/edit/${selected.uuid}`)}>Edit Warehouse</Button>
        </div>

        <div className="space-y-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
          {/* Header */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{selected.name}</p>
                <p className="font-mono text-xs text-slate-400 mt-1">{selected.code}</p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fv('Code', selected.code)}
            {fv('Address', selected.address || '—')}
            {fv('Routes', (selected as any).routes?.length ? (selected as any).routes.map((r: any) => r.name).join(', ') : '—')}
          </div>

          {/* Stock Items */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Stock Items</p>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Item</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">UOM</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {((selected as any).details ?? []).map((d: any, i: number) => (
                    <tr key={d.id ?? i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100">{d.itemName || '—'}</td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{d.uomName || '—'}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">{d.qty}</td>
                    </tr>
                  ))}
                  {!((selected as any).details?.length) && (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-xs">No stock items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
