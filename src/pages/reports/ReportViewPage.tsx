import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DataTable, Column } from '../../components/ui/DataTable';
import {
  ReportDateRangeToolbar,
  validateDateRange,
  type ReportDateRangeValue,
} from '../../components/reports/ReportDateRangeToolbar';
import { useReportDefinition, useReportQuery } from '../../hooks/useReports';
import { getDefaultReportRange } from '../../lib/reporting/dates';
import { formatReportCurrency } from '../../lib/reporting/format';
import {
  getReportColumns,
  isItemInventoryReport,
  isSnapshotReport,
} from '../../lib/reporting/reportColumns';
import {
  isReportDetailResult,
  isReportSalesCategorySummaryResult,
  isReportSalesSummaryResult,
  isReportTableResult,
  type ReportDetailRow,
  type ReportSalesCategorySummaryRow,
  type ReportSalesSummaryRow,
} from '../../types/reporting';
import { isAxiosError } from 'axios';

export default function ReportViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const { definition, isLoading: defLoading } = useReportDefinition(slug);
  const defaults = useMemo(() => getDefaultReportRange(), []);
  const [dateRange, setDateRange] = useState<ReportDateRangeValue>({
    ...defaults,
    compareToPrevious: false,
  });
  const [detailPage, setDetailPage] = useState(1);

  const isSalesSummary = slug === 'sales-summary';
  const isSalesCategorySummary = slug === 'sales-summary-category-wise';
  const isSalesAggregate = isSalesSummary || isSalesCategorySummary;
  const isStockReport =
    slug === 'inventory-stock' || slug === 'warehouse-operations';
  const isSnapshot = slug ? isSnapshotReport(slug) : false;
  const isItemReport = slug ? isItemInventoryReport(slug) : false;

  const rangeError = validateDateRange(dateRange.from, dateRange.to, 90);
  const rangeValid = !rangeError || isSnapshot;

  const detailPayload = useMemo(
    () =>
      slug && rangeValid
        ? {
            dateRange: { from: dateRange.from, to: dateRange.to },
            pagination: {
              page: detailPage,
              perPage: isSalesSummary ? 31 : 50,
            },
            ...(slug === 'low-stock-summary'
              ? { filters: { maxStockQty: 10 } }
              : {}),
          }
        : undefined,
    [slug, rangeValid, dateRange.from, dateRange.to, detailPage, isSalesSummary],
  );

  const detailQuery = useReportQuery(slug, detailPayload, Boolean(slug && rangeValid));

  const salesSummary =
    detailQuery.data && isReportSalesSummaryResult(detailQuery.data)
      ? detailQuery.data
      : null;

  const salesCategorySummary =
    detailQuery.data && isReportSalesCategorySummaryResult(detailQuery.data)
      ? detailQuery.data
      : null;

  const tableResult =
    detailQuery.data && isReportTableResult(detailQuery.data)
      ? detailQuery.data
      : null;

  const lineDetail =
    detailQuery.data && isReportDetailResult(detailQuery.data)
      ? detailQuery.data
      : null;

  const apiMessage =
    isAxiosError(detailQuery.error) && detailQuery.error.response?.data
      ? (detailQuery.error.response.data as { message?: string }).message
      : null;

  useEffect(() => {
    setDetailPage(1);
  }, [dateRange.from, dateRange.to, slug]);

  const salesCategorySummaryColumns: Column<ReportSalesCategorySummaryRow>[] = [
    { key: 'categoryName', header: 'Category', render: (r) => r.categoryName },
    {
      key: 'orderCount',
      header: 'Orders',
      align: 'right',
      render: (r) => r.orderCount,
    },
    {
      key: 'unitsSold',
      header: 'Qty sold',
      align: 'right',
      render: (r) => r.unitsSold,
    },
    {
      key: 'grossSales',
      header: 'Gross',
      align: 'right',
      render: (r) => formatReportCurrency(r.grossSales),
    },
    {
      key: 'discountTotal',
      header: 'Discount',
      align: 'right',
      render: (r) => formatReportCurrency(r.discountTotal),
    },
    {
      key: 'taxTotal',
      header: 'Tax',
      align: 'right',
      render: (r) => formatReportCurrency(r.taxTotal),
    },
    {
      key: 'netSales',
      header: 'Net sales',
      align: 'right',
      render: (r) => formatReportCurrency(r.netSales),
    },
    {
      key: 'avgOrderValue',
      header: 'Avg order',
      align: 'right',
      render: (r) => formatReportCurrency(r.avgOrderValue),
    },
  ];

  const salesSummaryColumns: Column<ReportSalesSummaryRow>[] = [
    { key: 'summaryDate', header: 'Date', render: (r) => r.summaryDate },
    {
      key: 'orderCount',
      header: 'Orders',
      align: 'right',
      render: (r) => r.orderCount,
    },
    {
      key: 'unitsSold',
      header: 'Qty sold',
      align: 'right',
      render: (r) => r.unitsSold,
    },
    {
      key: 'grossSales',
      header: 'Gross',
      align: 'right',
      render: (r) => formatReportCurrency(r.grossSales),
    },
    {
      key: 'discountTotal',
      header: 'Discount',
      align: 'right',
      render: (r) => formatReportCurrency(r.discountTotal),
    },
    {
      key: 'taxTotal',
      header: 'Tax',
      align: 'right',
      render: (r) => formatReportCurrency(r.taxTotal),
    },
    {
      key: 'netSales',
      header: 'Net sales',
      align: 'right',
      render: (r) => formatReportCurrency(r.netSales),
    },
    {
      key: 'avgOrderValue',
      header: 'Avg order',
      align: 'right',
      render: (r) => formatReportCurrency(r.avgOrderValue),
    },
  ];

  const lineColumns: Column<ReportDetailRow>[] = isStockReport
    ? [
        { key: 'orderCode', header: 'Warehouse', render: (r) => r.orderCode },
        { key: 'itemCode', header: 'Item code', render: (r) => r.itemCode },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName },
        {
          key: 'quantity',
          header: 'Stock qty',
          align: 'right',
          render: (r) => r.quantity,
        },
        {
          key: 'currentStatus',
          header: 'Location',
          render: (r) => r.currentStatus,
        },
      ]
    : [
        { key: 'orderDate', header: 'Date', render: (r) => r.orderDate },
        {
          key: 'orderCode',
          header: slug === 'returns-logistics' ? 'Return' : 'Order',
          render: (r) => r.orderCode,
        },
        { key: 'customerName', header: 'Customer', render: (r) => r.customerName },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName },
        {
          key: 'quantity',
          header: 'Qty',
          align: 'right',
          render: (r) => r.quantity,
        },
        {
          key: 'total',
          header: 'Total',
          align: 'right',
          render: (r) => formatReportCurrency(r.total),
        },
      ];

  const itemColumns = slug ? getReportColumns(slug) : [];

  const pagination =
    salesSummary?.metaPagination ??
    salesCategorySummary?.metaPagination ??
    tableResult?.metaPagination ??
    lineDetail?.metaPagination;

  const periodTotals =
    salesSummary?.meta.periodTotals ?? salesCategorySummary?.meta.periodTotals;
  const stockTotals = tableResult?.meta.periodTotals as
    | { totalQty?: number; skuCount?: number }
    | undefined;

  const toolbarSubtitle = isSnapshot
    ? `Snapshot as of ${tableResult?.meta.snapshotAsOf ?? dateRange.to}`
    : `${dateRange.from} → ${dateRange.to}`;

  if (defLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-64 rounded-xl bg-slate-200/50 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!definition) {
    return (
      <div className="p-4 sm:p-6 text-center py-16">
        <p className="text-slate-500">Report not found.</p>
        <Link to="/reports" className="text-brand-600 text-sm mt-2 inline-block">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
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
        title={definition.name}
        subtitle={toolbarSubtitle}
        value={dateRange}
        onChange={setDateRange}
        rangeError={isSnapshot ? null : rangeError}
        onReset={() => setDateRange({ ...defaults, compareToPrevious: false })}
      />

      {tableResult?.meta.note && (
        <p className="text-xs text-slate-500 px-1">{tableResult.meta.note}</p>
      )}

      {apiMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {apiMessage}
        </div>
      )}

      {slug === 'stock-summary' && stockTotals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'SKUs', value: String(stockTotals.skuCount ?? 0) },
            { label: 'Total units', value: String(stockTotals.totalQty ?? 0) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 px-3 py-2.5 shadow-sm"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {isSalesAggregate && periodTotals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Orders', value: String(periodTotals.orderCount) },
            { label: 'Qty sold', value: String(periodTotals.unitsSold) },
            { label: 'Gross', value: formatReportCurrency(periodTotals.grossSales) },
            { label: 'Net sales', value: formatReportCurrency(periodTotals.netSales) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 px-3 py-2.5 shadow-sm"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
        {isSalesSummary ? (
          <DataTable
            columns={salesSummaryColumns}
            data={salesSummary?.items ?? []}
            loading={detailQuery.isLoading}
            emptyMessage="No sales for this period."
          />
        ) : isSalesCategorySummary ? (
          <DataTable
            columns={salesCategorySummaryColumns}
            data={salesCategorySummary?.items ?? []}
            loading={detailQuery.isLoading}
            emptyMessage="No sales by category for this period."
          />
        ) : isItemReport && itemColumns.length > 0 ? (
          <DataTable
            columns={itemColumns}
            data={tableResult?.items ?? []}
            loading={detailQuery.isLoading}
            emptyMessage="No rows for this report."
          />
        ) : (
          <DataTable
            columns={lineColumns}
            data={lineDetail?.items ?? []}
            loading={detailQuery.isLoading}
            emptyMessage="No line items for this period."
          />
        )}
        {pagination && pagination.lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Page {pagination.currentPage} of {pagination.lastPage} · {pagination.total}{' '}
              {isSalesSummary ? 'days' : isSalesCategorySummary ? 'categories' : 'rows'}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={detailPage <= 1}
                onClick={() => setDetailPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={detailPage >= pagination.lastPage}
                onClick={() => setDetailPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
