import { formatDateLabel, formatReportCurrency } from '../../lib/reporting/format';
import type { ReportSeriesPoint } from '../../types/reporting';

interface ReportSeriesChartProps {
  series: ReportSeriesPoint[];
  metric?: 'netSales' | 'orderCount' | 'unitsSold';
  height?: number;
}

export function ReportSeriesChart({
  series,
  metric = 'netSales',
  height = 220,
}: ReportSeriesChartProps) {
  const emptyHint =
    metric === 'unitsSold'
      ? 'No stock rows found for your organisation.'
      : 'No data for this period. Run ETL sync if tables are empty.';

  if (series.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-sm text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg"
      >
        {emptyHint}
      </div>
    );
  }

  const values = series.map((p) => {
    if (metric === 'orderCount') {
      return p.orderCount;
    }
    if (metric === 'unitsSold') {
      return p.unitsSold;
    }
    return p.netSales;
  });
  const max = Math.max(...values, 1);
  const len = series.length;
  const points = series
    .map((d, i) => {
      const x = len <= 1 ? 50 : (i / (len - 1)) * 100;
      const val =
        metric === 'orderCount'
          ? d.orderCount
          : metric === 'unitsSold'
            ? d.unitsSold
            : d.netSales;
      const y = 100 - (val / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const formatY = (v: number) =>
    metric === 'netSales' ? formatReportCurrency(v) : String(Math.round(v));

  return (
    <div style={{ height }} className="w-full relative pt-4 pb-10 px-10">
      <div className="absolute left-0 top-4 bottom-10 w-14 flex flex-col justify-between text-[10px] text-slate-400 font-mono text-right pr-2">
        <span>{formatY(max)}</span>
        <span>{formatY(max / 2)}</span>
        <span>0</span>
      </div>
      <div className="w-full h-full border-l border-b border-slate-200 dark:border-slate-700/60 relative">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-brand-500"
            points={points}
          />
        </svg>
        <div className="absolute -bottom-8 inset-x-0 flex justify-between px-1 overflow-hidden">
          {series.map((d, i) =>
            i % Math.ceil(len / 6) === 0 || i === len - 1 ? (
              <span key={d.label} className="text-[10px] text-slate-400">
                {formatDateLabel(d.label)}
              </span>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
