export type ReportType = 'operational' | 'analytical' | 'compliance';

export interface ReportDefinition {
  uuid: string;
  slug: string;
  name: string;
  reportType: ReportType;
  baseTable: string;
  allowedMetrics: string[];
  allowedDimensions: string[];
  defaultFilters: Record<string, unknown>;
}

export interface ReportDateRange {
  from: string;
  to: string;
  compareTo?: 'previous_period';
}

export interface ReportQueryPayload {
  dateRange?: ReportDateRange;
  dimensions?: Record<string, unknown>;
  metrics?: string[];
  groupBy?: string[];
  filters?: Record<string, number | string>;
  pagination?: { page: number; perPage: number };
}

export interface ReportSeriesPoint {
  label: string;
  netSales: number;
  orderCount: number;
  unitsSold: number;
  grossSales: number;
  taxTotal: number;
  discountTotal: number;
}

export interface ReportKpis {
  netSales?: number;
  grossSales?: number;
  orderCount?: number;
  lineCount?: number;
  unitsSold?: number;
  taxTotal?: number;
  discountTotal?: number;
  avgOrderValue?: number;
}

export interface ReportComparison {
  previousNetSales: number;
  changePercent: number | null;
}

export interface ReportMisDailyPoint {
  date: string;
  orderCount: number;
  netSales: number;
  unitsSold: number;
}

export interface ReportMisKpis {
  orderCount: number;
  unitsSold: number;
  grossSales: number;
  netSales: number;
  taxTotal: number;
  discountTotal: number;
  avgOrderValue: number;
  activeCustomers: number;
  returnCount: number;
  returnValue: number;
  lowStockSkuCount: number;
}

export interface ReportMisComparison {
  previousNetSales: number;
  previousOrderCount: number;
  netSalesChangePercent: number | null;
  orderCountChangePercent: number | null;
}

export interface ReportMisResult {
  meta: {
    reportSlug: string;
    dateRange: { from: string; to: string };
    refreshedAt?: string | null;
    source: 'summary' | 'fact';
  };
  kpis: ReportMisKpis;
  comparison: ReportMisComparison | null;
  series: {
    daily: ReportMisDailyPoint[];
  };
  breakdowns: {
    orderStatus: Array<{ status: string; orderCount: number; netSales: number }>;
    topCustomers: Array<{
      customerUuid: string;
      name: string;
      orderCount: number;
      netSales: number;
    }>;
    topItems: Array<{
      itemUuid: string;
      itemCode: string;
      itemName: string;
      unitsSold: number;
      netSales: number;
    }>;
    topSalesmen: Array<{
      salesmanUuid: string;
      name: string;
      orderCount: number;
      netSales: number;
    }>;
    lowStock: Array<{
      itemCode: string;
      itemName: string;
      warehouseName: string;
      qty: number;
    }>;
  };
}

export function isReportMisResult(data: ReportQueryResult): data is ReportMisResult {
  return (
    'kpis' in data &&
    'series' in data &&
    'breakdowns' in data &&
    data.meta.reportSlug === 'mis-report'
  );
}

export interface ReportSummaryResult {
  meta: {
    reportSlug: string;
    dateRange: { from: string; to: string };
    refreshedAt?: string | null;
    source: 'summary' | 'fact';
  };
  kpis: ReportKpis;
  series: ReportSeriesPoint[];
  comparison: ReportComparison | null;
}

export interface ReportSalesSummaryRow {
  summaryDate: string;
  orderCount: number;
  lineCount: number;
  unitsSold: number;
  grossSales: number;
  netSales: number;
  taxTotal: number;
  discountTotal: number;
  avgOrderValue: number;
}

export interface ReportSalesCategorySummaryRow {
  categoryId: number | null;
  categoryName: string;
  orderCount: number;
  lineCount: number;
  unitsSold: number;
  grossSales: number;
  netSales: number;
  taxTotal: number;
  discountTotal: number;
  avgOrderValue: number;
}

export interface ReportPeriodTotals {
  orderCount: number;
  lineCount: number;
  unitsSold: number;
  grossSales: number;
  netSales: number;
  taxTotal: number;
  discountTotal: number;
  avgOrderValue: number;
}

export interface ReportDetailRow {
  orderUuid: string;
  orderCode: string;
  orderDate: string;
  customerName: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxAmount: number;
  currentStatus: string;
}

export interface ReportDetailResult {
  meta: {
    reportSlug: string;
    dateRange: { from: string; to: string };
    source: 'fact' | 'summary';
    periodTotals?: ReportPeriodTotals;
    refreshedAt?: string | null;
  };
  items: ReportDetailRow[];
  metaPagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

export interface ReportSalesSummaryResult {
  meta: ReportDetailResult['meta'];
  items: ReportSalesSummaryRow[];
  metaPagination: ReportDetailResult['metaPagination'];
}

export interface ReportSalesCategorySummaryResult {
  meta: ReportDetailResult['meta'];
  items: ReportSalesCategorySummaryRow[];
  metaPagination: ReportDetailResult['metaPagination'];
}

export function isReportSummaryResult(
  data: ReportQueryResult,
): data is ReportSummaryResult {
  return 'kpis' in data && 'series' in data && !('breakdowns' in data);
}

export type ReportTableRow = Record<string, string | number | boolean | null | undefined>;

export interface ReportTableResult {
  meta: {
    reportSlug: string;
    dateRange: { from: string; to: string };
    source: string;
    snapshotAsOf?: string;
    periodTotals?: ReportPeriodTotals | Record<string, number>;
    filters?: Record<string, number | string>;
    note?: string;
  };
  items: ReportTableRow[];
  metaPagination: ReportDetailResult['metaPagination'];
}

export type ReportQueryResult =
  | ReportMisResult
  | ReportSummaryResult
  | ReportDetailResult
  | ReportSalesSummaryResult
  | ReportSalesCategorySummaryResult
  | ReportTableResult;

export const SALES_AGGREGATE_REPORT_SLUGS = [
  'sales-summary',
  'sales-summary-category-wise',
] as const;

const LINE_DETAIL_SLUGS = [
  'order-management',
  'customer-sales',
  'returns-logistics',
  'inventory-stock',
  'warehouse-operations',
] as const;

export function isReportSalesSummaryResult(
  data: ReportQueryResult,
): data is ReportSalesSummaryResult {
  return (
    'items' in data &&
    'metaPagination' in data &&
    !('kpis' in data) &&
    data.meta.reportSlug === 'sales-summary'
  );
}

export function isReportSalesCategorySummaryResult(
  data: ReportQueryResult,
): data is ReportSalesCategorySummaryResult {
  return (
    'items' in data &&
    'metaPagination' in data &&
    !('kpis' in data) &&
    data.meta.reportSlug === 'sales-summary-category-wise'
  );
}

export function isReportTableResult(data: ReportQueryResult): data is ReportTableResult {
  return (
    'items' in data &&
    'metaPagination' in data &&
    !('kpis' in data) &&
    !LINE_DETAIL_SLUGS.includes(data.meta.reportSlug as (typeof LINE_DETAIL_SLUGS)[number]) &&
    !(SALES_AGGREGATE_REPORT_SLUGS as readonly string[]).includes(data.meta.reportSlug)
  );
}

export function isReportDetailResult(
  data: ReportQueryResult,
): data is ReportDetailResult {
  return (
    'items' in data &&
    'metaPagination' in data &&
    !('kpis' in data) &&
    LINE_DETAIL_SLUGS.includes(data.meta.reportSlug as (typeof LINE_DETAIL_SLUGS)[number])
  );
}
