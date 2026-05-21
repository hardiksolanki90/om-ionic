import type { Column } from '../../components/ui/DataTable';
import { formatReportCurrency } from './format';
import type { ReportTableRow } from '../../types/reporting';

export const ITEM_INVENTORY_REPORT_SLUGS = [
  'item-report-by-party',
  'item-sales-purchase-summary',
  'low-stock-summary',
  'rate-list',
  'stock-detail-report',
  'stock-summary',
] as const;

export const SNAPSHOT_REPORT_SLUGS = [
  'rate-list',
  'stock-detail-report',
  'stock-summary',
  'low-stock-summary',
  'inventory-stock',
  'warehouse-operations',
] as const;

export function isItemInventoryReport(slug: string): boolean {
  return (ITEM_INVENTORY_REPORT_SLUGS as readonly string[]).includes(slug);
}

export function isSnapshotReport(slug: string): boolean {
  return (SNAPSHOT_REPORT_SLUGS as readonly string[]).includes(slug);
}

export function getReportColumns(slug: string): Column<ReportTableRow>[] {
  switch (slug) {
    case 'item-report-by-party':
      return [
        { key: 'customerName', header: 'Party', render: (r) => r.customerName ?? '' },
        { key: 'itemCode', header: 'Item code', render: (r) => r.itemCode ?? '' },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName ?? '' },
        {
          key: 'quantity',
          header: 'Qty sold',
          align: 'right',
          render: (r) => r.quantity ?? 0,
        },
        {
          key: 'total',
          header: 'Sales',
          align: 'right',
          render: (r) => formatReportCurrency(Number(r.total ?? 0)),
        },
      ];
    case 'item-sales-purchase-summary':
      return [
        { key: 'itemCode', header: 'Item code', render: (r) => r.itemCode ?? '' },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName ?? '' },
        {
          key: 'salesQty',
          header: 'Sales qty',
          align: 'right',
          render: (r) => r.salesQty ?? 0,
        },
        {
          key: 'salesAmount',
          header: 'Sales amount',
          align: 'right',
          render: (r) => formatReportCurrency(Number(r.salesAmount ?? 0)),
        },
        {
          key: 'purchaseQty',
          header: 'Purchase qty',
          align: 'right',
          render: (r) => r.purchaseQty ?? 0,
        },
        {
          key: 'purchaseAmount',
          header: 'Purchase amount',
          align: 'right',
          render: (r) => formatReportCurrency(Number(r.purchaseAmount ?? 0)),
        },
      ];
    case 'low-stock-summary':
      return [
        { key: 'itemCode', header: 'Item code', render: (r) => r.itemCode ?? '' },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName ?? '' },
        {
          key: 'totalQty',
          header: 'Stock',
          align: 'right',
          render: (r) => r.totalQty ?? 0,
        },
        {
          key: 'threshold',
          header: 'Threshold',
          align: 'right',
          render: (r) => r.threshold ?? 0,
        },
        { key: 'stockStatus', header: 'Status', render: (r) => r.stockStatus ?? '' },
      ];
    case 'rate-list':
      return [
        { key: 'itemCode', header: 'Item code', render: (r) => r.itemCode ?? '' },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName ?? '' },
        { key: 'categoryName', header: 'Category', render: (r) => r.categoryName ?? '' },
        { key: 'brandName', header: 'Brand', render: (r) => r.brandName ?? '' },
        {
          key: 'price',
          header: 'Rate',
          align: 'right',
          render: (r) => formatReportCurrency(Number(r.price ?? 0)),
        },
        { key: 'uomName', header: 'UOM', render: (r) => r.uomName ?? '' },
        { key: 'itemStatus', header: 'Status', render: (r) => r.itemStatus ?? '' },
      ];
    case 'stock-detail-report':
      return [
        { key: 'warehouseName', header: 'Warehouse', render: (r) => r.warehouseName ?? '' },
        { key: 'itemCode', header: 'Item code', render: (r) => r.itemCode ?? '' },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName ?? '' },
        {
          key: 'quantity',
          header: 'Qty',
          align: 'right',
          render: (r) => r.quantity ?? 0,
        },
      ];
    case 'stock-summary':
      return [
        { key: 'itemCode', header: 'Item code', render: (r) => r.itemCode ?? '' },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName ?? '' },
        { key: 'categoryName', header: 'Category', render: (r) => r.categoryName ?? '' },
        {
          key: 'totalQty',
          header: 'Total stock',
          align: 'right',
          render: (r) => r.totalQty ?? 0,
        },
        {
          key: 'warehouseCount',
          header: 'Warehouses',
          align: 'right',
          render: (r) => r.warehouseCount ?? 0,
        },
        {
          key: 'price',
          header: 'Rate',
          align: 'right',
          render: (r) => formatReportCurrency(Number(r.price ?? 0)),
        },
      ];
    default:
      return [];
  }
}
