import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Download,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import {
  ReportDateRangeToolbar,
  validateDateRange,
  type ReportDateRangeValue,
} from '../../../components/reports/ReportDateRangeToolbar';
import { MisReportTable } from '../../../components/reports/mis/MisReportTable';
import { DailyLineChart } from '../../dashboard/DashboardCharts';
import { useReportQuery } from '../../../hooks/useReports';
import { getDefaultReportRange } from '../../../lib/reporting/dates';
import {
  formatChangePercent,
  formatDateLabel,
  formatReportCurrency,
  formatReportNumber,
} from '../../../lib/reporting/format';
import {
  getMisSectionBySlug,
  MIS_API_SLUG,
  type MisSectionId,
} from '../../../lib/reporting/misSections';
import { isReportMisResult, type ReportMisResult } from '../../../types/reporting';
import { getApiErrorMessage } from '../../../lib/apiError';
import { cn } from '../../../lib/cn';

export default function MisReportSectionPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\/reports\/?/, '').split('/')[0] ?? '';
  const section = getMisSectionBySlug(slug);

  if (slug === MIS_API_SLUG) {
    return <Navigate to="/reports/mis-overview" replace />;
  }

  if (!section) {
    return <Navigate to="/reports" replace />;
  }

  const defaults = useMemo(() => getDefaultReportRange(), []);
  const [dateRange, setDateRange] = useState<ReportDateRangeValue>({
    ...defaults,
    compareToPrevious: section.id === 'overview',
  });

  const rangeError = validateDateRange(dateRange.from, dateRange.to, 90);
  const rangeValid = !rangeError;

  const payload = useMemo(
    () =>
      rangeValid
        ? {
            dateRange: {
              from: dateRange.from,
              to: dateRange.to,
              ...(dateRange.compareToPrevious
                ? { compareTo: 'previous_period' as const }
                : {}),
            },
          }
        : undefined,
    [rangeValid, dateRange],
  );

  const { data, isLoading, isError, error } = useReportQuery(
    MIS_API_SLUG,
    payload,
    rangeValid,
  );

  const mis = data && isReportMisResult(data) ? data : null;

  const chartData = useMemo(() => {
    const daily = mis?.series.daily ?? [];
    if (daily.length === 0) {
      return [];
    }
    const maxNet = Math.max(...daily.map((d) => d.netSales), 1);
    return daily.map((d) => ({
      label: formatDateLabel(d.date),
      value: (d.netSales / maxNet) * 4,
    }));
  }, [mis?.series.daily]);

  const errorMessage = isError
    ? getApiErrorMessage(error, 'Could not load MIS data.')
    : null;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/reports"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          ← Report library
        </Link>
        <Button variant="outline" size="sm" disabled title="Export coming soon">
          <Download className="w-4 h-4 mr-1.5" />
          Export
        </Button>
      </div>

      <ReportDateRangeToolbar
        title={section.name}
        subtitle={section.description}
        value={dateRange}
        onChange={setDateRange}
        rangeError={rangeError}
        onReset={() =>
          setDateRange({
            ...defaults,
            compareToPrevious: section.id === 'overview',
          })
        }
      />

      {section.id === 'overview' && (
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={dateRange.compareToPrevious}
            onChange={(e) =>
              setDateRange({ ...dateRange, compareToPrevious: e.target.checked })
            }
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Compare to previous period
        </label>
      )}

      {isLoading && <MisSectionSkeleton sectionId={section.id} />}

      {isError && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-6 text-sm text-red-700 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {mis && !isLoading && (
        <MisSectionBody sectionId={section.id} mis={mis} chartData={chartData} />
      )}

      {mis?.meta.refreshedAt && !isLoading && (
        <p className="text-[11px] text-slate-400 text-right">
          Data refreshed {new Date(mis.meta.refreshedAt).toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
}

function MisSectionSkeleton({ sectionId }: { sectionId: MisSectionId }) {
  if (sectionId === 'overview') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-slate-200/60 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="h-72 rounded-lg bg-slate-200/60 dark:bg-slate-800 animate-pulse" />
  );
}

function MisSectionBody({
  sectionId,
  mis,
  chartData,
}: {
  sectionId: MisSectionId;
  mis: ReportMisResult;
  chartData: { label: string; value: number }[];
}) {
  switch (sectionId) {
    case 'overview':
      return <MisOverviewBody mis={mis} />;
    case 'daily-sales':
      return (
        <section className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm p-4">
          {chartData.length > 0 ? (
            <DailyLineChart data={chartData} height={280} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-16">No sales in range</p>
          )}
        </section>
      );
    case 'order-status':
      return (
        <MisReportTable
          title="Orders by status"
          icon={<ShoppingCart className="w-4 h-4 text-sky-600" />}
          headers={['Status', 'Orders', 'Net sales']}
          rows={mis.breakdowns.orderStatus.map((row) => [
            row.status,
            String(row.orderCount),
            formatReportCurrency(row.netSales),
          ])}
        />
      );
    case 'top-customers':
      return (
        <MisReportTable
          title="Top customers"
          icon={<Users className="w-4 h-4 text-violet-600" />}
          headers={['Customer', 'Orders', 'Net sales']}
          rows={mis.breakdowns.topCustomers.map((r) => [
            r.name,
            String(r.orderCount),
            formatReportCurrency(r.netSales),
          ])}
        />
      );
    case 'top-items':
      return (
        <MisReportTable
          title="Top items"
          icon={<BarChart3 className="w-4 h-4 text-amber-600" />}
          headers={['Item', 'Units', 'Net sales']}
          rows={mis.breakdowns.topItems.map((r) => [
            r.itemName,
            formatReportNumber(r.unitsSold),
            formatReportCurrency(r.netSales),
          ])}
        />
      );
    case 'top-salesmen':
      return (
        <MisReportTable
          title="Top salesmen"
          icon={<Users className="w-4 h-4 text-sky-600" />}
          headers={['Salesman', 'Orders', 'Net sales']}
          rows={mis.breakdowns.topSalesmen.map((r) => [
            r.name,
            String(r.orderCount),
            formatReportCurrency(r.netSales),
          ])}
        />
      );
    case 'low-stock':
      return (
        <MisReportTable
          title="Low stock"
          icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
          headers={['Item', 'Warehouse', 'Qty']}
          rows={mis.breakdowns.lowStock.map((r) => [
            r.itemName,
            r.warehouseName,
            formatReportNumber(r.qty),
          ])}
        />
      );
    default:
      return null;
  }
}

function MisOverviewBody({ mis }: { mis: ReportMisResult }) {
  const cards = [
    {
      label: 'Net sales',
      value: formatReportCurrency(mis.kpis.netSales),
      change: mis.comparison?.netSalesChangePercent,
    },
    {
      label: 'Orders',
      value: formatReportNumber(mis.kpis.orderCount),
      change: mis.comparison?.orderCountChangePercent,
    },
    { label: 'Units sold', value: formatReportNumber(mis.kpis.unitsSold) },
    { label: 'Avg order value', value: formatReportCurrency(mis.kpis.avgOrderValue) },
    { label: 'Active customers', value: formatReportNumber(mis.kpis.activeCustomers) },
    {
      label: 'Returns',
      value: formatReportNumber(mis.kpis.returnCount),
      sub: formatReportCurrency(mis.kpis.returnValue),
    },
    { label: 'Low-stock SKUs', value: formatReportNumber(mis.kpis.lowStockSkuCount) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4 shadow-sm"
        >
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            {card.label}
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</p>
          {'sub' in card && card.sub && (
            <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
          )}
          {card.change !== undefined && (
            <p
              className={cn(
                'text-xs font-medium mt-1 flex items-center gap-0.5',
                (card.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
              )}
            >
              {(card.change ?? 0) >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {formatChangePercent(card.change)} vs prior
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
