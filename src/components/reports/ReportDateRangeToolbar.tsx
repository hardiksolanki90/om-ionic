import { CalendarRange, X, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface ReportDateRangeValue {
  from: string;
  to: string;
  compareToPrevious: boolean;
}

interface ReportDateRangeToolbarProps {
  title: string;
  subtitle?: string;
  value: ReportDateRangeValue;
  onChange: (value: ReportDateRangeValue) => void;
  maxDays?: number;
  rangeError: string | null;
  onReset: () => void;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const PRESETS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: 'MTD', mode: 'mtd' as const },
  { label: 'LM', mode: 'last_month' as const },
];

export function applyDatePreset(
  preset: (typeof PRESETS)[number],
): Pick<ReportDateRangeValue, 'from' | 'to'> {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if ('mode' in preset && preset.mode === 'mtd') {
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return { from: formatDate(start), to: formatDate(end) };
  }

  if ('mode' in preset && preset.mode === 'last_month') {
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 0);
    return { from: formatDate(start), to: formatDate(last) };
  }

  const start = new Date(end);
  start.setDate(start.getDate() - (preset.days! - 1));
  return { from: formatDate(start), to: formatDate(end) };
}

export function validateDateRange(
  from: string,
  to: string,
  maxDays: number,
): string | null {
  if (!from || !to) {
    return 'Select a start and end date.';
  }
  const start = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  if (end < start) {
    return 'End date must be on or after start date.';
  }
  const diffDays =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays > maxDays) {
    return `Date range cannot exceed ${maxDays} days (${diffDays} selected).`;
  }
  return null;
}

export function ReportDateRangeToolbar({
  title,
  subtitle,
  value,
  onChange,
  maxDays = 90,
  rangeError,
  onReset,
}: ReportDateRangeToolbarProps) {
  const todayStr = formatDate(new Date());

  const maxEndDate = (() => {
    if (!value.from) {
      return todayStr;
    }
    const [y, m, d] = value.from.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    const maxFromStart = new Date(start);
    maxFromStart.setDate(maxFromStart.getDate() + maxDays - 1);
    const today = new Date();
    return formatDate(maxFromStart < today ? maxFromStart : today);
  })();

  return (
    <div className="space-y-2">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
            <CalendarRange className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">{title}</h2>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {PRESETS.map((preset) => {
              const applied = applyDatePreset(preset);
              const isActive = value.from === applied.from && value.to === applied.to;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange({ ...value, from: applied.from, to: applied.to })}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-bold rounded-md transition-all',
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400',
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <input
            type="date"
            value={value.from}
            max={value.to || todayStr}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="h-8 w-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-[12px]"
          />
          <span className="text-slate-400 text-xs">→</span>
          <input
            type="date"
            value={value.to}
            min={value.from}
            max={maxEndDate}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="h-8 w-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-[12px]"
          />

          <button
            type="button"
            onClick={onReset}
            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-500"
            title="Reset filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {rangeError && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/20 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {rangeError}
        </div>
      )}
    </div>
  );
}
