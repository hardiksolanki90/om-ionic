import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, Check, X } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface SelectOption {
  id: number | string
  label: string
}

interface SearchSelectProps {
  label?: string
  value: number | string | null
  displayValue?: string
  onChange: (id: number | string, label: string) => void
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  clearable?: boolean
}

export function SearchSelect({
  label,
  value,
  displayValue,
  onChange,
  options,
  placeholder = 'Select…',
  required,
  clearable,
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const selected = options.find(o => o.id === value)
  const displayLabel = selected?.label ?? displayValue ?? null

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setIsOpen(o => !o); setSearch('') }}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-lg ring-1 ring-slate-300 dark:ring-slate-700 border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-500/50 transition-all',
            isOpen && 'border-brand-400 ring-2 ring-brand-400/20'
          )}
        >
          <span className={cn(
            displayLabel
              ? 'text-slate-900 dark:text-slate-100'
              : 'text-slate-400 dark:text-slate-500'
          )}>
            {displayLabel ?? placeholder}
          </span>
          <div className="flex items-center gap-1">
            {clearable && displayLabel && (
              <span
                role="button"
                onClick={e => { e.stopPropagation(); onChange('', '') }}
                className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </span>
            )}
            <ChevronDown className={cn('h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform', isOpen && 'rotate-180')} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-lg dark:shadow-2xl">
            <div className="border-b border-slate-100 dark:border-slate-700/60 p-2">
              <div className="flex items-center gap-2 rounded-md bg-slate-50 dark:bg-slate-900 px-2 py-1.5 border border-slate-200 dark:border-slate-700/60 focus-within:border-brand-400">
                <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <input
                  autoFocus
                  className="w-full bg-transparent text-sm focus:outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto scrollbar-thin">
              {filtered.length === 0 ? (
                <p className="p-3 text-center text-sm text-slate-400 dark:text-slate-500">No results</p>
              ) : (
                filtered.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { onChange(opt.id, opt.label); setIsOpen(false); setSearch('') }}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors',
                      opt.id === value
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    )}
                  >
                    <span>{opt.label}</span>
                    {opt.id === value && <Check className="h-4 w-4 text-brand-500" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
