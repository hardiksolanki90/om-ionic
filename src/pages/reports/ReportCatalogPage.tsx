import { useMemo, useState } from 'react';
import { Search, FileBarChart } from 'lucide-react';
import { ReportCategoryCard } from '../../components/reports/ReportCategoryCard';
import { useReportCatalog } from '../../hooks/useReports';
import { useReportFavourites } from '../../hooks/useReportFavourites';
import { getApiErrorMessage } from '../../lib/apiError';
import { groupReportsForCatalog } from '../../lib/reporting/catalogGroups';

export default function ReportCatalogPage() {
  const { data: reports = [], isLoading, isError, error } = useReportCatalog();
  const { favourites, toggleFavourite, isFavourite, isPredefinedFavourite } =
    useReportFavourites();
  const [search, setSearch] = useState('');

  const errorMessage = isError
    ? getApiErrorMessage(
        error,
        'Could not load the report catalog. Ensure reporting is seeded on the API.',
      )
    : null;

  const groups = useMemo(
    () => groupReportsForCatalog(reports, favourites),
    [reports, favourites],
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return groups;
    }
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.slug.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0 || g.category.id === 'favourite');
  }, [groups, search]);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Report library
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Browse by category and open any report to view details.
          </p>
        </div>
        <div className="flex items-center gap-2 h-10 w-full sm:w-64 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-brand-500/20 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-52 rounded-lg bg-slate-200/60 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-6 text-sm text-red-700 dark:text-red-300 space-y-2">
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {!isLoading && !isError && filteredGroups.every((g) => g.items.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <FileBarChart className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">No reports match your search.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredGroups.map(({ category, items }) => (
            <ReportCategoryCard
              key={category.id}
              category={category}
              items={items}
              isFavourite={isFavourite}
              isPredefinedFavourite={isPredefinedFavourite}
              onToggleFavourite={toggleFavourite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
