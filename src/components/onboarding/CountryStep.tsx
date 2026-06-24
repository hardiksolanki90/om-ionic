import { useMemo, useState } from 'react'
import { Check, Globe, Search } from 'lucide-react'
import type { Country } from '../../types/organisationOnboarding'
import { onboardingInputClass } from './onboardingStyles'

interface Props {
  countries: Country[]
  countryId: number | null
  loading: boolean
  countriesLoading?: boolean
  countriesError?: boolean
  taxSystem?: string
  error?: string
  onSelect: (country: Country) => void
}

export function CountryStep({
  countries,
  countryId,
  loading,
  countriesLoading,
  countriesError,
  taxSystem,
  error,
  onSelect,
}: Props) {
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()
  const isSearching = query.length > 0

  const filtered = useMemo(() => {
    if (!query) return []
    return countries.filter(c =>
      c.name.toLowerCase().includes(query)
      || c.countryCode.toLowerCase().includes(query)
      || (c.currencyCode?.toLowerCase().includes(query) ?? false)
      || (c.dialCode?.includes(query) ?? false),
    )
  }, [countries, query])

  const selected = countries.find(c => c.id === countryId)
  const showList = isSearching && filtered.length > 0 && !countriesLoading && !countriesError && countries.length > 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        Select your country. We will auto-configure currency, fiscal year, tax labels, and compliance settings.
      </p>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="search"
          placeholder="Search by country name…"
          value={search}
          disabled={countriesLoading}
          onChange={e => setSearch(e.target.value)}
          className={`${onboardingInputClass} pl-9 pr-4 py-2.5 ${
            error ? 'border-red-400 dark:border-red-500/50' : ''
          }`}
        />
      </div>

      {countriesLoading ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-500 dark:text-slate-400">
          <div className="w-5 h-5 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin mr-2" />
          Loading countries…
        </div>
      ) : countriesError ? (
        <div className="py-10 text-center text-sm text-red-500 dark:text-red-400">
          Failed to load countries. Please refresh the page.
        </div>
      ) : countries.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          <Globe size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          No countries available. Run the country seeder on the server.
        </div>
      ) : selected && !isSearching ? (
        <div className="rounded-lg border border-brand-200 dark:border-brand-500/40 bg-brand-500/5 dark:bg-brand-500/10 px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{selected.name}</p>
          <Check size={18} className="shrink-0 text-brand-500 dark:text-brand-400" />
        </div>
      ) : !isSearching ? (
        <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
          <Globe size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          Start typing to search from {countries.length} countries
        </div>
      ) : showList ? (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            {selected && (
              <span className="font-medium text-brand-600 dark:text-brand-400 truncate ml-2">
                Selected: {selected.name}
              </span>
            )}
          </div>

          <ul
            className={`max-h-72 overflow-y-auto rounded-lg border bg-white dark:bg-slate-800/80 divide-y divide-slate-100 dark:divide-slate-700 ${
              error ? 'border-red-300 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-700'
            }`}
            role="listbox"
            aria-label="Countries"
          >
            {filtered.map(c => {
              const isSelected = c.id === countryId
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={loading}
                    onClick={() => {
                      onSelect(c)
                      setSearch('')
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-brand-500/8 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300'
                        : 'text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    } ${loading ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    <span className="flex-1 min-w-0 truncate font-medium">{c.name}</span>
                    {isSelected && <Check size={16} className="shrink-0 text-brand-500 dark:text-brand-400" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}

      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      {loading && <p className="text-xs text-slate-500 dark:text-slate-400">Loading tax & financial defaults…</p>}

      {taxSystem && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 text-xs font-semibold">
          Auto-detected: {taxSystem.toUpperCase()} tax system
        </div>
      )}
    </div>
  )
}
