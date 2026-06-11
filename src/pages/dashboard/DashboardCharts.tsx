import React from 'react'

interface ChartProps {
  data: { label: string; value: number }[]
  height?: number
  className?: string
}

function formatAxisLabel(label: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [, month, day] = label.split('-')
    return `${month}/${day}`
  }

  return label
}

function chartMax(values: number[], floor = 1): number {
  if (values.length === 0) {
    return floor
  }

  return Math.max(...values, floor)
}

/**
 * Simple Bar Chart for Route-wise Sales
 */
export const RouteBarChart = ({ data, height = 200 }: ChartProps) => {
  if (data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-slate-400">
        No route sales data
      </div>
    )
  }

  const max = chartMax(data.map((d) => d.value), 1)

  return (
    <div style={{ height }} className="w-full relative pt-4 pb-8 px-8">
      <div className="absolute left-0 top-4 bottom-8 w-8 flex flex-col justify-between text-[10px] text-slate-400 font-mono text-right pr-2">
        <span>{max.toLocaleString()}</span>
        <span>{(max / 2).toLocaleString()}</span>
        <span>0</span>
      </div>

      <div className="w-full h-full border-l border-b border-slate-200 dark:border-slate-700/60 flex items-end justify-around gap-4 px-4 relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-t border-slate-100 dark:border-slate-700/60 border-dashed" />
          <div className="w-full border-t border-slate-100 dark:border-slate-700/60 border-dashed" />
          <div className="h-0" />
        </div>

        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group relative max-w-[80px] min-h-full justify-end">
            <div
              className="w-full min-h-[4px] bg-brand-500 rounded-t-md transition-all duration-500 hover:bg-brand-600 cursor-pointer shadow-sm shadow-brand-100"
              style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
              title={`${d.label}: ${d.value.toLocaleString()}`}
            />
            <span className="absolute -bottom-8 text-[10px] text-slate-400 font-mono whitespace-nowrap">
              {formatAxisLabel(d.label)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Line Chart for Daily Sales
 */
export const DailyLineChart = ({ data, height = 200 }: ChartProps) => {
  if (data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-slate-400">
        No sales data for selected period
      </div>
    )
  }

  const max = chartMax(data.map((d) => d.value), 1)
  const single = data.length === 1
  const point = data[0]

  const linePoints = single
    ? `50,${100 - (point.value / max) * 100} 50,100`
    : data
        .map((d, i) => {
          const x = (i / (data.length - 1)) * 100
          const y = 100 - (d.value / max) * 100
          return `${x},${y}`
        })
        .join(' ')

  return (
    <div style={{ height }} className="w-full relative pt-4 pb-10 px-8">
      <div className="absolute left-0 top-4 bottom-10 w-8 flex flex-col justify-between text-[10px] text-slate-400 font-mono text-right pr-2">
        <span>{max.toLocaleString()}</span>
        <span>{(max / 2).toLocaleString()}</span>
        <span>0</span>
      </div>

      <div className="w-full h-full border-l border-b border-slate-200 dark:border-slate-700/60 relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-t border-slate-100 dark:border-slate-700/60 border-dashed" />
          <div className="w-full border-t border-slate-100 dark:border-slate-700/60 border-dashed" />
          <div className="h-0" />
        </div>

        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          {single ? (
            <>
              <line x1="50" y1={100 - (point.value / max) * 100} x2="50" y2="100" stroke="#10B981" strokeWidth="2" />
              <circle cx="50" cy={100 - (point.value / max) * 100} r="4" fill="#10B981" />
            </>
          ) : (
            <>
              <polyline fill="none" stroke="#10B981" strokeWidth="2" points={linePoints} vectorEffect="non-scaling-stroke" />
              {data.map((d, i) => {
                const x = (i / (data.length - 1)) * 100
                const y = 100 - (d.value / max) * 100
                return <circle key={i} cx={x} cy={y} r="3" fill="#10B981" />
              })}
            </>
          )}
        </svg>

        <div className="absolute -bottom-8 inset-x-0 flex justify-between px-1">
          {data.map((d, i) => (
            <span key={i} className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatAxisLabel(d.label)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Area Chart for Average Order Value
 */
export const AovAreaChart = ({ data, height = 240 }: ChartProps) => {
  if (data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-slate-400">
        No AOV data for selected period
      </div>
    )
  }

  const max = chartMax(data.map((d) => d.value), 1)
  const single = data.length === 1
  const point = data[0]
  const y = 100 - (point.value / max) * 100

  const getPath = (isClosed = false): string => {
    if (single) {
      const line = `M 50,${y} L 50,100`
      return isClosed ? `${line} L 50,100 Z` : `M 50,${y}`
    }

    let path = `M 0,${100 - (data[0].value / max) * 100}`

    for (let i = 1; i < data.length; i++) {
      const x = (i / (data.length - 1)) * 100
      const pointY = 100 - (data[i].value / max) * 100
      const prevX = ((i - 1) / (data.length - 1)) * 100
      const cpX = (prevX + x) / 2
      path += ` C ${cpX},${100 - (data[i - 1].value / max) * 100} ${cpX},${pointY} ${x},${pointY}`
    }

    if (isClosed) {
      path += ' L 100,100 L 0,100 Z'
    }

    return path
  }

  return (
    <div style={{ height }} className="w-full relative pt-4 pb-12 px-10">
      <div className="absolute left-0 top-4 bottom-12 w-10 flex flex-col justify-between text-[10px] text-slate-400 font-mono text-right pr-2">
        <span>{max.toLocaleString()}</span>
        <span>{(max * 0.75).toLocaleString()}</span>
        <span>{(max * 0.5).toLocaleString()}</span>
        <span>{(max * 0.25).toLocaleString()}</span>
        <span>0</span>
      </div>

      <div className="w-full h-full border-l border-b border-slate-200 dark:border-slate-700/60 relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-t border-slate-50 dark:border-slate-700/60" />
          <div className="w-full border-t border-slate-50 dark:border-slate-700/60" />
          <div className="w-full border-t border-slate-50 dark:border-slate-700/60" />
          <div className="w-full border-t border-slate-50 dark:border-slate-700/60" />
          <div className="h-0" />
        </div>

        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {single ? (
            <>
              <polygon points={`50,${y} 50,100 45,100 55,100`} fill="url(#purpleGradient)" />
              <line x1="50" y1={y} x2="50" y2="100" stroke="#8B5CF6" strokeWidth="2" />
              <circle cx="50" cy={y} r="4" fill="#8B5CF6" />
            </>
          ) : (
            <>
              <path d={getPath(true)} fill="url(#purpleGradient)" />
              <path d={getPath()} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
              {data.map((d, i) => {
                const x = (i / (data.length - 1)) * 100
                const pointY = 100 - (d.value / max) * 100
                return <circle key={i} cx={x} cy={pointY} r="3" fill="#8B5CF6" />
              })}
            </>
          )}
        </svg>

        <div className="absolute -bottom-8 inset-x-0 flex justify-between px-1">
          {data.map((d, i) => (
            <span key={i} className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatAxisLabel(d.label)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
