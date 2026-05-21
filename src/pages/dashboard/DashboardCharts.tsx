import React from 'react'
import { cn } from '../../lib/cn'

interface ChartProps {
  data: any[]
  height?: number
  className?: string
}

/**
 * Simple Bar Chart for Route-wise Sales
 */
export const RouteBarChart = ({ data, height = 200 }: ChartProps) => {
  const max = Math.max(...data.map(d => d.value), 200)
  
  return (
    <div style={{ height }} className="w-full relative pt-4 pb-8 px-8">
      {/* Y-Axis Labels */}
      <div className="absolute left-0 top-4 bottom-8 w-8 flex flex-col justify-between text-[10px] text-slate-400 font-mono text-right pr-2">
        <span>{max}</span>
        <span>{max / 2}</span>
        <span>0</span>
      </div>
      
      {/* Chart Area */}
      <div className="w-full h-full border-l border-b border-slate-200 dark:border-slate-700/60 flex items-end justify-around gap-4 px-4 relative">
        {/* Horizontal Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-t border-slate-100 dark:border-slate-700/60 border-dashed" />
          <div className="w-full border-t border-slate-100 dark:border-slate-700/60 border-dashed" />
          <div className="h-0" />
        </div>
        
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group relative max-w-[80px]">
            <div 
              className="w-full bg-brand-500 rounded-t-md transition-all duration-500 hover:bg-brand-600 cursor-pointer shadow-sm shadow-brand-100"
              style={{ height: `${(d.value / max) * 100}%` }}
            >
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {d.label}: {d.value}
              </div>
            </div>
            {/* X-Axis Label */}
            <span className="absolute -bottom-8 text-[10px] text-slate-400 font-mono rotate-45 origin-left whitespace-nowrap">
              {d.label}
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

  const max = Math.max(...data.map(d => d.value), 1)
  const points = data.map((d, i) => {
    const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100
    const y = 100 - (d.value / max) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ height }} className="w-full relative pt-4 pb-8 px-8">
      {/* Y-Axis Labels */}
      <div className="absolute left-0 top-4 bottom-8 w-8 flex flex-col justify-between text-[10px] text-slate-400 font-mono text-right pr-2">
        <span>{max.toLocaleString()}</span>
        <span>{(max / 2).toLocaleString()}</span>
        <span>0</span>
      </div>

      <div className="w-full h-full border-l border-b border-slate-200 dark:border-slate-700/60 relative overflow-visible">
        {/* Horizontal Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-t border-slate-100 dark:border-slate-700/60 border-dashed" />
          <div className="w-full border-t border-slate-100 dark:border-slate-700/60 border-dashed" />
          <div className="h-0" />
        </div>

        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          <polyline
            fill="none"
            stroke="#10B981"
            strokeWidth="1.5"
            points={points}
            className="transition-all duration-1000"
          />
          {data.map((d, i) => {
            const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100
            const y = 100 - (d.value / max) * 100
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill="#10B981"
                className="hover:r-2 transition-all cursor-pointer"
              />
            )
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="absolute -bottom-6 inset-x-0 flex justify-between px-1">
          {data.map((d, i) => (
            <span key={i} className="text-[10px] text-slate-400 lowercase first-letter:uppercase">{d.label}</span>
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

  const max = Math.max(...data.map(d => d.value), 1)

  // Create SVG path for smooth curve
  const getPath = (isClosed = false) => {
    if (data.length === 0) return ''

    if (data.length === 1) {
      const y = 100 - (data[0].value / max) * 100
      const path = `M 50,${y}`
      return isClosed ? `${path} L 50,100 L 50,100 Z` : path
    }

    let path = `M 0,${100 - (data[0].value / max) * 100}`

    for (let i = 1; i < data.length; i++) {
        const x = (i / (data.length - 1)) * 100
        const y = 100 - (data[i].value / max) * 100
        
        // Simple smoothing
        const prevX = ((i - 1) / (data.length - 1)) * 100
        const cpX = (prevX + x) / 2
        path += ` C ${cpX},${100 - (data[i-1].value / max) * 100} ${cpX},${y} ${x},${y}`
    }
    
    if (isClosed) {
      path += ` L 100,100 L 0,100 Z`
    }
    
    return path
  }

  return (
    <div style={{ height }} className="w-full relative pt-4 pb-12 px-10">
      {/* Y-Axis Labels */}
      <div className="absolute left-0 top-4 bottom-12 w-10 flex flex-col justify-between text-[10px] text-slate-400 font-mono text-right pr-2">
        <span>{max.toLocaleString()}</span>
        <span>{(max * 0.75).toLocaleString()}</span>
        <span>{(max * 0.5).toLocaleString()}</span>
        <span>{(max * 0.25).toLocaleString()}</span>
        <span>0</span>
      </div>

      <div className="w-full h-full border-l border-b border-slate-200 dark:border-slate-700/60 relative overflow-visible">
        {/* Horizontal Grid Lines */}
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
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={getPath(true)} fill="url(#purpleGradient)" />
          <path d={getPath()} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
          
          {data.map((d, i) => {
             const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100
             const y = 100 - (d.value / max) * 100
             return (
               <circle key={i} cx={x} cy={y} r="1.5" fill="#8B5CF6" />
             )
          })}
        </svg>

        {/* X-Axis Labels (Sampled for better spacing) */}
        <div className="absolute -bottom-8 inset-x-0 flex justify-between px-1">
          {data.map((d, i) => i % 2 === 0 ? (
            <span key={i} className="text-[10px] text-slate-400 lowercase first-letter:uppercase">{d.label}</span>
          ) : null)}
        </div>
      </div>
    </div>
  )
}
