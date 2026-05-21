import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { cn } from '../../lib/cn';
import {
  misCatalogDisplayName,
  REPORT_LIST_COLLAPSE_THRESHOLD,
  reportDisplayName,
  type ReportCatalogCategory,
} from '../../lib/reporting/catalogGroups';
import type { ReportDefinition } from '../../types/reporting';

interface ReportCategoryCardProps {
  category: ReportCatalogCategory;
  items: ReportDefinition[];
  isFavourite: (slug: string) => boolean;
  isPredefinedFavourite?: (slug: string) => boolean;
  onToggleFavourite: (slug: string) => void;
}

export function ReportCategoryCard({
  category,
  items,
  isFavourite,
  isPredefinedFavourite,
  onToggleFavourite,
}: ReportCategoryCardProps) {
  const [expanded, setExpanded] = useState(true);
  const canCollapse = items.length > REPORT_LIST_COLLAPSE_THRESHOLD;
  const visibleItems =
    canCollapse && !expanded
      ? items.slice(0, REPORT_LIST_COLLAPSE_THRESHOLD)
      : items;

  const Icon = category.icon;

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden h-full min-h-[12rem]">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-sky-50 dark:bg-sky-950/40 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white dark:bg-slate-800 border border-sky-100 dark:border-sky-900 text-sky-600 dark:text-sky-400 shadow-sm">
          <Icon className="w-4 h-4" strokeWidth={2} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {category.label}
        </h3>
      </div>

      <ul className="flex-1 py-1">
        {items.length === 0 && category.id === 'favourite' && (
          <li className="px-4 py-6 text-xs text-slate-400 text-center">
            Star a report in any category to pin it here.
          </li>
        )}
        {visibleItems.map((report) => {
          const pinned = isPredefinedFavourite?.(report.slug) ?? false;
          const starred = pinned || isFavourite(report.slug);
          return (
            <li key={report.uuid}>
              <div className="group flex items-center gap-1 pr-2 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <Link
                  to={`/reports/${report.slug}`}
                  className="flex-1 min-w-0 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 truncate"
                >
                  {category.id === 'mis'
                    ? misCatalogDisplayName(report.name)
                    : reportDisplayName(report.name)}
                </Link>
                <button
                  type="button"
                  disabled={pinned}
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleFavourite(report.slug);
                  }}
                  className={cn(
                    'shrink-0 p-1 rounded-md transition-colors',
                    starred
                      ? 'text-amber-500 opacity-100'
                      : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-500',
                    pinned && 'cursor-default',
                  )}
                  aria-label={
                    pinned
                      ? 'Default favourite'
                      : starred
                        ? 'Remove from favourites'
                        : 'Add to favourites'
                  }
                >
                  <Star
                    className="w-4 h-4"
                    fill={starred ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-center gap-1 w-full py-2.5 text-xs font-medium text-brand-600 dark:text-brand-400 border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
        >
          {expanded ? (
            <>
              See less <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              See more ({items.length - REPORT_LIST_COLLAPSE_THRESHOLD} more){' '}
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
