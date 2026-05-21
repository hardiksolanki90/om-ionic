import React, { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, Check, Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
// import { useInfinitesalesman } from '../../hooks/usesalesman'
import InfiniteScroll from './InfiniteScroll'

interface InfiniteSalesmanSelectProps {
  value: string | number
  onChange: (value: string | number) => void
  label?: string
  placeholder?: string
  error?: string
}

export function InfiniteSalesmanSelect({
  value,
  onChange,
  label,
  placeholder = 'Select Salesman',
  error,
}: InfiniteSalesmanSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // --- DUMMY DATA LOGIC START ---
  const MOCK_salesman = React.useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      uuid: `uuid-${i + 1}`,
      firstname: `Salesman`,
      lastname: `${i + 1}`,
    })),
    [])

  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  const isLoading = false
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)

  const filteredsalesman = React.useMemo(() => {
    return MOCK_salesman.filter(s =>
      `${s.firstname} ${s.lastname}`.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [MOCK_salesman, debouncedSearch])

  const hasNextPage = page * itemsPerPage < filteredsalesman.length

  const fetchNextPage = async () => {
    if (!hasNextPage) return
    setIsFetchingNextPage(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network
    setPage(p => p + 1)
    setIsFetchingNextPage(false)
  }

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const salesman = filteredsalesman.slice(0, page * itemsPerPage)
  // --- DUMMY DATA LOGIC END ---

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedSalesman = MOCK_salesman.find((s) => s.id === value || s.uuid === value)
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
            'flex h-9 w-full items-center justify-between rounded-lg ring-1 ring-slate-300 dark:ring-slate-700 border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 ',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-500/50 transition-all',
            error && 'border-red-400 dark:border-red-500 focus:ring-red-400 dark:focus:ring-red-500/50'
          )}
        >
          <span className={cn(!selectedSalesman && 'text-slate-400 dark:text-slate-500')}>
            {selectedSalesman ? `${selectedSalesman.firstname} ${selectedSalesman.lastname}` : placeholder}
          </span>
          <ChevronDown className={cn('h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-lg animate-in fade-in zoom-in duration-150">
            <div className="sticky top-0 z-10 border-b border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-2">
              <div className="flex items-center gap-2 rounded-md bg-slate-50 dark:bg-slate-900 px-2 py-1.5 border border-slate-200 dark:border-slate-700/60 focus-within:border-brand-400 dark:focus-within:border-brand-500">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  autoFocus
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  placeholder="Search salesman..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto scrollbar-thin flex flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400 dark:text-slate-500" />
                </div>
              ) : salesman.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No salesman found
                </div>
              ) : (
                <>
                  {salesman.map((salesman) => (
                    <button
                      key={salesman.id}
                      type="button"
                      onClick={() => {
                        onChange(salesman.id)
                        setIsOpen(false)
                      }}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors',
                        (salesman.id === value || salesman.uuid === value) && 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                      )}
                    >
                      <span>{salesman.firstname} {salesman.lastname}</span>
                      {(salesman.id === value || salesman.uuid === value) && <Check className="h-4 w-4" />}
                    </button>
                  ))}

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

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
