import type { Column } from '../../components/ui/DataTable'
import { formatReportCurrency } from './format'
import type { ReportTableRow } from '../../types/reporting'

export const ITEM_INVENTORY_REPORT_SLUGS = [
  'item-report-by-party',
  'item-sales-purchase-summary',
  'low-stock-summary',
  'rate-list',
  'stock-detail-report',
  'stock-summary',
] as const

export type ItemInventoryReportSlug = (typeof ITEM_INVENTORY_REPORT_SLUGS)[number]

export const SNAPSHOT_REPORT_SLUGS = [
  'rate-list',
  'stock-detail-report',
  'stock-summary',
  'low-stock-summary',
  'inventory-stock',
  'warehouse-operations',
] as const

export type SnapshotReportSlug = (typeof SNAPSHOT_REPORT_SLUGS)[number]

export function isItemInventoryReport(slug: string): slug is ItemInventoryReportSlug {
  return (ITEM_INVENTORY_REPORT_SLUGS as readonly string[]).includes(slug)
}

export function isSnapshotReport(slug: string): slug is SnapshotReportSlug {
  return (SNAPSHOT_REPORT_SLUGS as readonly string[]).includes(slug)
}

export function getReportColumns(slug: string): Column<ReportTableRow>[] {
  switch (slug) {
    case 'sales-summary':
      return [
        { key: 'orderDate',      header: 'Date' },
        { key: 'orderCount',     header: 'Orders',       align: 'right', render: (r) => r.orderCount     ?? 0 },
        { key: 'unitsSold',      header: 'Units sold',   align: 'right', render: (r) => r.unitsSold      ?? 0 },
        { key: 'grossSales',     header: 'Gross sales',  align: 'right', render: (r) => formatReportCurrency(Number(r.grossSales     ?? 0)) },
        { key: 'discountTotal',  header: 'Discount',     align: 'right', render: (r) => formatReportCurrency(Number(r.discountTotal  ?? 0)) },
        { key: 'taxTotal',       header: 'Tax',          align: 'right', render: (r) => formatReportCurrency(Number(r.taxTotal       ?? 0)) },
        { key: 'netSales',       header: 'Net sales',    align: 'right', render: (r) => formatReportCurrency(Number(r.netSales       ?? 0)) },
      ]

    case 'sales-summary-category-wise':
      return [
        { key: 'categoryName',   header: 'Category',     render: (r) => r.categoryName ?? '' },
        { key: 'orderCount',     header: 'Orders',       align: 'right', render: (r) => r.orderCount    ?? 0 },
        { key: 'unitsSold',      header: 'Units sold',   align: 'right', render: (r) => r.unitsSold     ?? 0 },
        { key: 'grossSales',     header: 'Gross sales',  align: 'right', render: (r) => formatReportCurrency(Number(r.grossSales    ?? 0)) },
        { key: 'discountTotal',  header: 'Discount',     align: 'right', render: (r) => formatReportCurrency(Number(r.discountTotal ?? 0)) },
        { key: 'netSales',       header: 'Net sales',    align: 'right', render: (r) => formatReportCurrency(Number(r.netSales      ?? 0)) },
      ]

    case 'order-management':
      return [
        { key: 'orderCode',      header: 'Order #',      render: (r) => r.orderCode     ?? r.orderNumber ?? '' },
        { key: 'orderDate',      header: 'Date' },
        { key: 'customerName',   header: 'Customer',     render: (r) => r.customerName  ?? '' },
        { key: 'salesmanName',   header: 'Salesman',     render: (r) => r.salesmanName  ?? '' },
        { key: 'itemCount',      header: 'Items',        align: 'right', render: (r) => r.itemCount      ?? r.lineCount ?? 0 },
        { key: 'grossTotal',     header: 'Gross',        align: 'right', render: (r) => formatReportCurrency(Number(r.grossTotal    ?? 0)) },
        { key: 'discountTotal',  header: 'Discount',     align: 'right', render: (r) => formatReportCurrency(Number(r.discountTotal ?? 0)) },
        { key: 'taxTotal',       header: 'Tax',          align: 'right', render: (r) => formatReportCurrency(Number(r.taxTotal      ?? 0)) },
        { key: 'netTotal',       header: 'Net total',    align: 'right', render: (r) => formatReportCurrency(Number(r.netTotal      ?? 0)) },
        { key: 'status',         header: 'Status',       render: (r) => r.status ?? '' },
      ]

    case 'customer-sales':
      return [
        { key: 'customerName',   header: 'Customer',     render: (r) => r.customerName  ?? '' },
        { key: 'shopName',       header: 'Shop',         render: (r) => r.shopName      ?? '' },
        { key: 'salesmanName',   header: 'Salesman',     render: (r) => r.salesmanName  ?? '' },
        { key: 'routeName',      header: 'Route',        render: (r) => r.routeName     ?? '' },
        { key: 'orderCount',     header: 'Orders',       align: 'right', render: (r) => r.orderCount    ?? 0 },
        { key: 'unitsSold',      header: 'Units sold',   align: 'right', render: (r) => r.unitsSold     ?? 0 },
        { key: 'grossSales',     header: 'Gross sales',  align: 'right', render: (r) => formatReportCurrency(Number(r.grossSales   ?? 0)) },
        { key: 'netSales',       header: 'Net sales',    align: 'right', render: (r) => formatReportCurrency(Number(r.netSales     ?? 0)) },
      ]

    case 'returns-logistics':
      return [
        { key: 'returnCode',     header: 'Return #',     render: (r) => r.returnCode    ?? r.returnNumber ?? '' },
        { key: 'returnDate',     header: 'Date' },
        { key: 'orderCode',      header: 'Order #',      render: (r) => r.orderCode     ?? '' },
        { key: 'customerName',   header: 'Customer',     render: (r) => r.customerName  ?? '' },
        { key: 'salesmanName',   header: 'Salesman',     render: (r) => r.salesmanName  ?? '' },
        { key: 'itemName',       header: 'Item',         render: (r) => r.itemName      ?? '' },
        { key: 'quantity',       header: 'Qty returned', align: 'right', render: (r) => r.quantity      ?? 0 },
        { key: 'returnValue',    header: 'Return value', align: 'right', render: (r) => formatReportCurrency(Number(r.returnValue  ?? r.total ?? 0)) },
        { key: 'status',         header: 'Status',       render: (r) => r.status        ?? '' },
      ]

    case 'inventory-stock':
      return [
        { key: 'warehouseName',  header: 'Warehouse',    render: (r) => r.warehouseName ?? '' },
        { key: 'itemCode',       header: 'Item code',    render: (r) => r.itemCode      ?? '' },
        { key: 'itemName',       header: 'Item',         render: (r) => r.itemName      ?? '' },
        { key: 'categoryName',   header: 'Category',     render: (r) => r.categoryName  ?? '' },
        { key: 'quantity',       header: 'Qty in stock', align: 'right', render: (r) => r.quantity      ?? 0 },
        { key: 'price',          header: 'Rate',         align: 'right', render: (r) => formatReportCurrency(Number(r.price        ?? 0)) },
        { key: 'stockValue',     header: 'Stock value',  align: 'right', render: (r) => formatReportCurrency(Number(r.stockValue   ?? 0)) },
      ]

    case 'warehouse-operations':
      return [
        { key: 'warehouseName',  header: 'Warehouse',    render: (r) => r.warehouseName ?? '' },
        { key: 'itemCount',      header: 'SKUs',         align: 'right', render: (r) => r.itemCount     ?? r.skuCount ?? 0 },
        { key: 'totalQty',       header: 'Total qty',    align: 'right', render: (r) => r.totalQty      ?? 0 },
        { key: 'stockValue',     header: 'Stock value',  align: 'right', render: (r) => formatReportCurrency(Number(r.stockValue   ?? 0)) },
      ]

    case 'item-report-by-party':
      return [
        { key: 'customerName', header: 'Party', render: (r) => r.customerName ?? '' },
        { key: 'itemCode', header: 'Item code', render: (r) => r.itemCode ?? '' },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName ?? '' },
        { key: 'quantity', header: 'Qty sold', align: 'right', render: (r) => r.quantity ?? 0 },
        {
          key: 'total',
          header: 'Sales',
          align: 'right',
          render: (r) => formatReportCurrency(Number(r.total ?? 0)),
        },
      ]

    case 'item-sales-purchase-summary':
      return [
        { key: 'itemCode', header: 'Item code', render: (r) => r.itemCode ?? '' },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName ?? '' },
        { key: 'salesQty', header: 'Sales qty', align: 'right', render: (r) => r.salesQty ?? 0 },
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
      ]

    case 'low-stock-summary':
      return [
        { key: 'itemCode', header: 'Item code', render: (r) => r.itemCode ?? '' },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName ?? '' },
        { key: 'totalQty', header: 'Stock', align: 'right', render: (r) => r.totalQty ?? 0 },
        {
          key: 'threshold',
          header: 'Threshold',
          align: 'right',
          render: (r) => r.threshold ?? 0,
        },
        { key: 'stockStatus', header: 'Status', render: (r) => r.stockStatus ?? '' },
      ]

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
      ]

    case 'stock-detail-report':
      return [
        { key: 'warehouseName', header: 'Warehouse', render: (r) => r.warehouseName ?? '' },
        { key: 'itemCode', header: 'Item code', render: (r) => r.itemCode ?? '' },
        { key: 'itemName', header: 'Item', render: (r) => r.itemName ?? '' },
        { key: 'quantity', header: 'Qty', align: 'right', render: (r) => r.quantity ?? 0 },
      ]

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
      ]

    default:
      return []
  }
}
