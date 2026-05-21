/** All catalog slugs are published and queryable via the API. */
export const PUBLISHED_REPORT_SLUGS = [
  'sales-summary',
  'sales-summary-category-wise',
  'order-management',
  'customer-sales',
  'returns-logistics',
  'stock-summary',
  'stock-detail-report',
  'low-stock-summary',
  'rate-list',
  'item-sales-purchase-summary',
  'item-report-by-party',
  'inventory-stock',
  'warehouse-operations',
] as const;

export type PublishedReportSlug = (typeof PUBLISHED_REPORT_SLUGS)[number];

export function isReportLive(slug: string): slug is PublishedReportSlug {
  return (PUBLISHED_REPORT_SLUGS as readonly string[]).includes(slug);
}

export const REPORT_CHART_METRIC: Record<string, 'netSales' | 'orderCount' | 'unitsSold'> = {
  'sales-summary': 'netSales',
  'order-management': 'netSales',
  'customer-sales': 'netSales',
  'returns-logistics': 'netSales',
  'inventory-stock': 'unitsSold',
  'warehouse-operations': 'unitsSold',
};

export const REPORT_TYPE_LABELS: Record<string, string> = {
  operational: 'Operational',
  analytical: 'Analytical',
  compliance: 'Compliance',
};

export const METRIC_LABELS: Record<string, string> = {
  netSales: 'Net sales',
  grossSales: 'Gross sales',
  orderCount: 'Orders',
  lineCount: 'Line items',
  unitsSold: 'Units sold',
  taxTotal: 'Tax',
  discountTotal: 'Discounts',
  avgOrderValue: 'Avg order value',
};

export const REPORT_SLUG_DESCRIPTIONS: Record<string, string> = {
  'sales-summary':
    'Daily sales totals — orders, quantity, gross and net sales for the selected period.',
  'sales-summary-category-wise':
    'Sales totals grouped by item category for the selected period.',
  'order-management':
    'Order volume, revenue, and line-level detail for the selected period.',
  'customer-sales':
    'Customer and salesman performance with daily sales trends.',
  'returns-logistics':
    'Return volumes, values, and line-level reverse logistics for the period.',
  'inventory-stock':
    'Current stock levels by item and warehouse (snapshot as of period end).',
  'warehouse-operations':
    'Stock distribution and throughput by warehouse location.',
  'stock-summary':
    'Total stock quantity per item across all warehouses.',
  'stock-detail-report':
    'Stock quantity by warehouse and item (godown-wise detail).',
  'low-stock-summary':
    'Items at or below the low-stock threshold (default 10 units).',
  'rate-list':
    'Item master with selling rates, category, brand, and UOM.',
  'item-sales-purchase-summary':
    'Sales quantity and value per item for the period (purchase N/A).',
  'item-report-by-party':
    'Sales quantity and value by customer (party) and item.',
};
