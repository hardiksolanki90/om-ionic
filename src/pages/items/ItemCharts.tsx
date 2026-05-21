import React from 'react'

interface DataPoint {
  label: string
  unitsSold: number
  revenue: number
  orderCount: number
}

interface ItemSalesChartProps {
  data: DataPoint[]
  height?: number
  metric?: 'unitsSold' | 'revenue'
}

export const ItemSalesChart = ({ data, height = 280, metric = 'unitsSold' }: ItemSalesChartProps) => {
  const values = data.map(d => d[metric])
  const max = Math.max(...values, 1)

  const formatValue = (v: number) =>
    metric === 'revenue' ? `$${v.toLocaleString()}` : `${v} units`

  return (
    <div style={{ height }} className="w-full relative pt-4 pb-12 px-10">
      {/* Y-Axis Labels */}
      <div className="absolute left-0 top-4 bottom-12 w-10 flex flex-col justify-between text-[10px] text-slate-400 font-mono text-right pr-3">
        <span>{metric === 'revenue' ? `$${max}` : max}</span>
        <span>{metric === 'revenue' ? `$${Math.round(max * 0.5)}` : Math.round(max * 0.5)}</span>
        <span>0</span>
      </div>

      <div className="w-full h-full border-l border-b border-slate-200 dark:border-slate-700/60 relative">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-t border-dashed border-slate-100 dark:border-slate-800" />
          <div className="w-full border-t border-dashed border-slate-100 dark:border-slate-800" />
          <div className="h-0" />
        </div>

        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-slate-400">No sales data for this period.</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-end justify-around px-3 gap-1.5 md:gap-3 relative">
            {data.map((d, i) => {
              const val = d[metric]
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative max-w-[60px]">
                  <div
                    className="w-full bg-brand-500 dark:bg-brand-600 rounded-t-lg transition-all duration-700 ease-out hover:bg-brand-400 cursor-pointer relative shadow-sm"
                    style={{ height: `${(val / max) * 100}%`, minHeight: val > 0 ? '4px' : '0' }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-20 pointer-events-none shadow-xl">
                      <div className="text-[8px] uppercase tracking-wider opacity-60 mb-0.5">{d.label}</div>
                      <div>{formatValue(val)}</div>
                      <div className="text-[9px] opacity-70">{d.orderCount} order{d.orderCount !== 1 ? 's' : ''}</div>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-slate-900 dark:bg-slate-100" />
                    </div>
                  </div>
                  <span className="absolute -bottom-8 text-[9px] font-bold text-slate-400 uppercase tracking-tight text-center truncate max-w-full px-1">
                    {d.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
