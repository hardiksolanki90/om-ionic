import React, { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, Check, Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import InfiniteScroll from './InfiniteScroll'

interface InfiniteRouteSelectProps {
  value: string | number
  onChange: (value: string | number) => void
  label?: string
  placeholder?: string
  error?: string
}

export function InfiniteRouteSelect({
  value,
  onChange,
  label,
  placeholder = 'Select Route',
  error,
}: InfiniteRouteSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // --- DUMMY DATA LOGIC START ---
  const MOCK_ROUTES = React.useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      uuid: `uuid-${i + 1}`,
      name: `Route ${i + 1}`,
      code: `R-${1000 + i}`,
    })),
    [])

  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  const isLoading = false
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)

  const filteredRoutes = React.useMemo(() => {
    return MOCK_ROUTES.filter(r =>
      `${r.name} ${r.code}`.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [MOCK_ROUTES, debouncedSearch])

  const hasNextPage = page * itemsPerPage < filteredRoutes.length

  const fetchNextPage = async () => {
    if (!hasNextPage) return
    setIsFetchingNextPage(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setPage(p => p + 1)
    setIsFetchingNextPage(false)
  }

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const routes = filteredRoutes.slice(0, page * itemsPerPage)
  // --- DUMMY DATA LOGIC END ---

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedRoute = MOCK_ROUTES.find(r =>
    r.id === value || r.uuid === value || String(r.id) === String(value)
  )

  return (
    <div className="flex flex-col gap-1.5" ref={dropdownRef}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-1 ring-slate-300 dark:ring-slate-700',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all',
            error && 'border-red-400 dark:border-red-500/50 focus:ring-red-400'
          )}
        >
          <span className={cn(
            selectedRoute
              ? 'text-slate-900 dark:text-slate-100'
              : 'text-slate-400 dark:text-slate-500'
          )}>
            {selectedRoute ? selectedRoute.name : placeholder}
          </span>
          <ChevronDown className={cn('h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-lg dark:shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="sticky top-0 z-10 border-b border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-2">
              <div className="flex items-center gap-2 rounded-md bg-slate-50 dark:bg-slate-900 px-2 py-1.5 border border-slate-200 dark:border-slate-700/60 focus-within:border-brand-400">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  autoFocus
                  className="w-full bg-transparent text-sm focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Search routes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto scrollbar-thin flex flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400 dark:text-slate-500" />
                </div>
              ) : routes.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No routes found
                </div>
              ) : (
                <>
                  {routes.map(route => {
                    const isSelected = String(route.id) === String(value) || String(route.uuid) === String(value)
                    return (
                      <button
                        key={route.id}
                        type="button"
                        onClick={() => { onChange(String(route.id)); setIsOpen(false) }}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 text-sm transition-colors',
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        )}
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-medium text-slate-900 dark:text-slate-100">{route.name}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{route.code}</span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
                      </button>
                    )
                  })}

                  <InfiniteScroll
                    hasNextPage={hasNextPage}
                    fetchNextPage={fetchNextPage}
                    disabled={isFetchingNextPage}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
