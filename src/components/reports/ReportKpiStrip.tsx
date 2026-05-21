import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/cn';
import { METRIC_LABELS } from '../../lib/reporting/constants';
import {
  formatChangePercent,
  formatReportCurrency,
  formatReportNumber,
} from '../../lib/reporting/format';
import type { ReportComparison, ReportKpis } from '../../types/reporting';

interface ReportKpiStripProps {
  kpis: ReportKpis;
  metrics: string[];
  comparison?: ReportComparison | null;
  isLoading?: boolean;
}

function formatMetricValue(key: string, value: number | undefined): string {
  if (value === undefined) {
    return '—';
  }
  if (
    key === 'netSales' ||
    key === 'grossSales' ||
    key === 'taxTotal' ||
    key === 'discountTotal' ||
    key === 'avgOrderValue'
  ) {
    return formatReportCurrency(value);
  }
  return formatReportNumber(value);
}

export function ReportKpiStrip({
  kpis,
  metrics,
  comparison,
  isLoading,
}: ReportKpiStripProps) {
  const displayMetrics = metrics.length > 0 ? metrics : Object.keys(kpis);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMetrics.slice(0, 4).map((key) => (
          <div
            key={key}
            className="h-24 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {displayMetrics.map((key) => {
        const showComparison =
          key === 'netSales' && comparison?.changePercent !== undefined;
        const change = comparison?.changePercent;
        const isUp = change !== null && change !== undefined && change >= 0;

        return (
          <div
            key={key}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {METRIC_LABELS[key] ?? key}
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatMetricValue(key, kpis[key as keyof ReportKpis])}
            </p>
            {showComparison && change !== null && (
              <div
                className={cn(
                  'mt-2 flex items-center gap-1 text-xs font-semibold',
                  isUp ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {isUp ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {formatChangePercent(change)} vs prior period
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
