import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PER_PAGE_OPTIONS, calcShowingRange, buildPageNumbers } from '../../lib/paginationUtils'

interface PaginationFooterProps {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
  isFetching?: boolean
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export function PaginationFooter({
  currentPage,
  lastPage,
  total,
  perPage,
  isFetching = false,
  onPageChange,
  onPerPageChange,
}: PaginationFooterProps) {
  const pageNumbers = useMemo(
    () => buildPageNumbers(currentPage, lastPage),
    [currentPage, lastPage]
  )

  if (lastPage <= 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-700/60">
      {/* Showing X – Y of Z */}
      <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {calcShowingRange(currentPage, perPage, total)}
      </p>

      <div className="flex items-center gap-4 flex-wrap justify-center">
        {/* Page buttons */}
        {lastPage > 1 && (
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1 || isFetching}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers.map((page, idx) =>
              page === 'ellipsis' ? (
                <span key={`e-${idx}`} className="px-1.5 text-slate-400 text-sm select-none">…</span>
              ) : (
                <button
                  key={page}
                  disabled={isFetching}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-60 ${
                    currentPage === page
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              disabled={currentPage === lastPage || isFetching}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Per-page selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Rows per page</span>
          <select
            value={perPage}
            onChange={e => onPerPageChange(Number(e.target.value))}
            className="h-7 px-2 rounded-md text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-400"
          >
            {PER_PAGE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
