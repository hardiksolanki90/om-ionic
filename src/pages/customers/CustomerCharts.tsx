import React from 'react'
import type { CustomerPerformanceChartPoint } from '../../types/customer'

interface CustomerOrderChartProps {
  data: CustomerPerformanceChartPoint[]
  height?: number
  metric?: 'orderCount' | 'revenue'
}

export const CustomerOrderChart = ({
  data,
  height = 300,
  metric = 'orderCount',
}: CustomerOrderChartProps) => {
  const values = data.map(d => (metric === 'revenue' ? d.revenue : d.orderCount))
  const max = Math.max(...values, 1)

  const formatValue = (v: number) =>
    metric === 'revenue' ? `$${v.toLocaleString()}` : `${v} orders`

  return (
    <div style={{ height }} className="w-full relative pt-4 pb-12 px-10">
      <div className="absolute left-0 top-4 bottom-12 w-10 flex flex-col justify-between text-[10px] text-slate-400 font-mono text-right pr-3">
        <span>{metric === 'revenue' ? `$${max}` : max}</span>
        <span>{metric === 'revenue' ? `$${Math.round(max * 0.5)}` : Math.round(max * 0.5)}</span>
        <span>0</span>
      </div>

      <div className="w-full h-full border-l border-b border-slate-200 dark:border-slate-700/60 relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-t border-dashed border-slate-100 dark:border-slate-800" />
          <div className="w-full border-t border-dashed border-slate-100 dark:border-slate-800" />
          <div className="h-0" />
        </div>

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-500 italic">
            No orders in this period.
          </div>
        ) : (
          <div className="w-full h-full flex items-end justify-around px-4 gap-2 md:gap-4 relative">
            {data.map((d, i) => {
              const value = metric === 'revenue' ? d.revenue : d.orderCount
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative max-w-[60px]">
                  <div
                    className="w-full bg-brand-500 dark:bg-brand-600 rounded-t-lg transition-all duration-700 ease-out hover:bg-brand-400 dark:hover:bg-brand-500 cursor-pointer relative shadow-sm"
                    style={{ height: `${(value / max) * 100}%` }}
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-20 pointer-events-none shadow-xl">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] uppercase tracking-tighter opacity-60 mb-0.5">{d.label}</span>
                        <span>{formatValue(value)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="absolute -bottom-8 text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-center">
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
