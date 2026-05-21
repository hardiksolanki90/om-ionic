// ─── Shared pagination helpers (mirrors OrderList.tsx pattern) ────────────────

export const PER_PAGE_OPTIONS = [10, 15, 20, 50]
export const DEFAULT_PER_PAGE = 15

export function parseUrlParams(search: string): { page: number; perPage: number; searchQuery: string } {
  const params = new URLSearchParams(search)
  const page    = parseInt(params.get('page')    || '1', 10)
  const perPage = parseInt(params.get('perPage') || String(DEFAULT_PER_PAGE), 10)
  return {
    page:        isNaN(page)    || page < 1 ? 1 : page,
    perPage:     PER_PAGE_OPTIONS.includes(perPage) ? perPage : DEFAULT_PER_PAGE,
    searchQuery: params.get('search') || '',
  }
}

export function buildUrlParams(base: string, page: number, perPage: number, search: string): string {
  const params = new URLSearchParams()
  if (page    > 1)                  params.set('page',    String(page))
  if (perPage !== DEFAULT_PER_PAGE) params.set('perPage', String(perPage))
  if (search.trim())                params.set('search',  search.trim())
  const qs = params.toString()
  return `${base}${qs ? `?${qs}` : ''}`
}

export function calcShowingRange(currentPage: number, perPage: number, total: number) {
  if (total === 0) return 'No results'
  const from = (currentPage - 1) * perPage + 1
  const to   = Math.min(currentPage * perPage, total)
  return `Showing ${from}–${to} of ${total}`
}

export function buildPageNumbers(currentPage: number, lastPage: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = []
  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(lastPage - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    if (currentPage < lastPage - 2) pages.push('ellipsis')
    if (!pages.includes(lastPage)) pages.push(lastPage)
  }
  return pages
}
