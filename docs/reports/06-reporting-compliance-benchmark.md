# Reporting & Compliance Benchmark Gap Analysis

## Purpose

This document maps a **standard Indian wholesale / accounting-style report catalog** (typical of billing + inventory + GST suites) against the **current Order Management admin app** (`om-ionic` + `om-laravel`).

It extends the five domain reports in this folder by answering: *“If we need these reports, what exists today, what is partial, and what is net-new?”*

**Legend**

| Status | Meaning |
|--------|---------|
| **Implemented** | Available in UI or API with meaningful parity |
| **Partial** | Related data exists; not the full report format or compliance output |
| **Missing** | No model, API, or screen |
| **N/A** | Out of product scope (accounting suite feature, not OMS) |

---

## 1. Executive Summary

- The current product is an **operational OMS** (orders, returns, items, customers, warehouses, field sales)—not a full **accounting, GST filing, or ledger** system.
- Of **34 named reports** in the benchmark catalog (excluding “Favourite”), **~4 are partially covered**, **~30 are missing** as first-class reports.
- **Closest existing capabilities:** Dashboard sales/AOV charts, entity `performance` / `sales-stats`, item `stock-levels`, dashboard low-stock, Excel **export/import** on several masters (brands, categories, customers, warehouses, areas, routes, salesman)—not on orders/items.
- **Tax today:** Category-level `tax` rate on items (`ItemResource` / `CategoryResource`); line-level tax on orders is calculated in the UI—**no HSN/SAC**, **no GSTR JSON**, **no TDS/TCS**.
- **Purchases:** No purchase orders or vendor bills—**GSTR-2**, purchase summaries, and GST purchase reports are **N/A** until a purchase module exists.
- **Parties:** Customers exist as master data; **no ledger, outstanding balance, ageing, or party statement**.
- **Godown:** Mapped to **warehouse**; stock by location is partial (`stock-levels`, `warehouses/{uuid}/stock`), not a full godown-wise stock summary report.
- **Audit trail:** Not implemented in `om-laravel` models reviewed (no Spatie Activity Log on entities in this codebase).

---

## 2. Benchmark Catalog → System Mapping

### Favourite

| Report | Status | Notes |
|--------|--------|-------|
| Favourite | **N/A** | UX convenience (pinned reports)—not a data report |

---

### GST & statutory (India)

| Report | Status | Current system | Gap |
|--------|--------|----------------|-----|
| GSTR-1 (Sales) | **Missing** | Sales in `orders` + `order_details` | Need GSTIN, place of supply, invoice type, HSN summary export in govt format |
| GSTR-2 (Purchase) | **N/A** | No purchase/vendor invoices | Requires purchase module |
| GSTR-3B | **Missing** | — | Consolidated monthly return; needs GST ledger |
| GST Sales (With HSN) | **Missing** | No HSN on items | Add `hsn_code`, tax split (CGST/SGST/IGST) |
| GST Purchase (With HSN) | **N/A** | No purchases | Purchase module |
| HSN Wise Sales Summary | **Missing** | — | Aggregate `order_details` by HSN |
| GST (generic) | **Partial** | Category `tax` %; order line tax in `OrderForm` | Not GST compliance reporting |

| Report | Status | Notes |
|--------|--------|-------|
| TDS Payable | **Missing** | No TDS deduction tracking |
| TDS Receivable | **Missing** | — |
| TCS Payable | **Missing** | No TCS on sales |
| TCS Receivable | **Missing** | — |

**Evidence:** No `hsn`, `gstin`, `tds`, `tcs` in `om-laravel` app code or migrations grep; tax from `category.tax` only.

---

### Financial statements & P&L

| Report | Status | Current system | Gap |
|--------|--------|----------------|-----|
| Balance Sheet | **N/A** | No chart of accounts | Accounting product |
| Profit And Loss Report | **N/A** | No expense/revenue ledger | Needs GL + expenses |
| Bill Wise Profit | **Missing** | Order-level revenue in DB | No cost/COGS per bill → no profit |
| Sales Summary | **Partial** | `GET /admin/dashboard` daily sales; per-entity performance APIs | Not invoice-register style export |
| Purchase Summary | **N/A** | No purchases | Purchase module |

---

### Transaction & cash books

| Report | Status | Current system | Gap |
|--------|--------|----------------|-----|
| Audit Trail | **Missing** | — | User/action log on CRUD (see [01-order-management-system.md](./01-order-management-system.md)) |
| Cash and Bank Report (All Payments) | **Missing** | No payment receipts, bank accounts | Payments module |
| Daybook | **Missing** | — | Chronological money book |
| Expense Category Report | **Missing** | No expenses entity | Expense module |
| Expense Transaction Report | **Missing** | — | Expense module |

---

### Item & inventory reports

| Report | Status | Current system | Gap |
|--------|--------|----------------|-----|
| Item (master listing) | **Implemented** | `ItemList` + `GET /admin/items` | Rate/price on item |
| Item Report By Party | **Missing** | — | Sales by customer × item matrix |
| Item Sales and Purchase Summary | **Partial** | `items/{uuid}/sales-stats` (sales only) | No purchase side; no org-wide item summary report |
| Low Stock Summary | **Partial** | Dashboard `lowStock` (qty ≤ 5, top 10) | Not configurable threshold report/export |
| Rate List | **Partial** | Item list with `price` | No dedicated rate-list PDF/print |
| Stock Detail Report | **Partial** | `items/{uuid}/stock-levels`; `warehouses/{uuid}/stock` | Not a printable stock detail across all SKUs |
| Stock Summary | **Partial** | Warehouse stock API | No aggregated “all items” summary page |
| Stock Summary - Godown wise | **Partial** | Warehouse = godown; per-warehouse stock endpoint | No godown-wise summary report UI |

See [03-inventory-stock-availability.md](./03-inventory-stock-availability.md), [05-warehouse-distribution-operations.md](./05-warehouse-distribution-operations.md).

---

### Party (customer / debtor) reports

| Report | Status | Current system | Gap |
|--------|--------|----------------|-----|
| Receivable Ageing Report | **Missing** | No AR balance or due dates on orders | Credit terms + ledger |
| Party Report By Item | **Missing** | — | Pivot: party × item qty/revenue |
| Party Statement (Ledger) | **Missing** | — | Running balance per customer |
| Party Wise Outstanding | **Missing** | — | Outstanding from unpaid invoices |
| Sales Summary - Category Wise | **Partial** | `categories/{uuid}/performance`, `sales-stats` | Not a single org-wide category-wise sales report screen |

See [04-customer-sales-performance.md](./04-customer-sales-performance.md).

---

## 3. Coverage Summary

| Category | Total | Implemented | Partial | Missing / N/A |
|----------|-------|-------------|---------|----------------|
| GST & TDS/TCS | 11 | 0 | 1 | 10 |
| Financial / P&L | 5 | 0 | 1 | 4 |
| Transaction / expenses | 5 | 0 | 0 | 5 |
| Item / stock | 8 | 1 | 7 | 0 |
| Party | 5 | 0 | 1 | 4 |
| **Total (excl. Favourite)** | **34** | **1** | **10** | **23** |

*“Partial” counts include items that are **N/A** for purchase-heavy reports if counted strictly as missing business capability.*

---

## 4. What the OMS Already Provides (building blocks)

These are **not** named like the benchmark catalog but supply data for future reports:

| Building block | API / UI | Could feed |
|----------------|----------|------------|
| Sales orders | `orders`, `order_details` | Sales Summary, GSTR-1, HSN summary |
| Returns | `returns`, return items | Credit notes, sales adjustment |
| Item master | `items`, brands, categories, UOM | Rate list, HSN master |
| Stock on hand | `warehouse_details`, `stock-levels` | Stock Summary, godown-wise |
| Customer master | `customers` | Party reports (with ledger) |
| Time-series sales | `*/performance`, `items/sales-stats` | Sales trends, category analysis |
| Dashboard KPIs | `GET /admin/dashboard` | Executive sales summary |
| Excel export | areas, brands, categories, customers, routes, salesman, warehouses | Ad-hoc analysis in Excel |

**Not available:** purchases, payments, bank, expenses, GL, HSN, GSTIN on parties, invoice numbering beyond order/return codes, credit limits, due dates.

---

## 5. Recommended Phasing (reporting roadmap)

### Phase R1 — Operational reports (OMS-native, **S–M**)

Reports that need **no GST/ledger**—only SQL + export UI:

| Priority | Report | Source data |
|----------|--------|-------------|
| P0 | Sales Summary (register) | `orders` filtered by date, customer, route |
| P0 | Stock Summary + Godown wise | `warehouse_details` grouped by warehouse |
| P0 | Low Stock Summary (configurable) | Extend dashboard query + export |
| P1 | Item Sales Summary (all SKUs) | Aggregate `order_details` |
| P1 | Sales Summary - Category Wise | Join orders → items → categories |
| P1 | Party Report By Item | `order_details` × customer |
| P1 | Rate List | `items` export with price, UOM |

**Deliverable:** Reports menu + CSV/Excel export; reuse `Maatwebsite\Excel` already used for master import/export.

### Phase R2 — Party credit & outstanding (**M**)

| Report | Requires |
|--------|----------|
| Party Wise Outstanding | Invoice payment status, opening balance |
| Receivable Ageing | Due date, ageing buckets |
| Party Statement (Ledger) | Debit/credit entries per customer |

**Depends on:** Treating orders as invoices + payment allocation (even simple paid/unpaid).

### Phase R3 — Profitability (**M**)

| Report | Requires |
|--------|----------|
| Bill Wise Profit | Cost price on items or purchase cost; margin per `order` |
| Item Sales and Purchase Summary (full) | Purchase/cost module |

### Phase R4 — GST & compliance (**L**)

| Report | Requires |
|--------|----------|
| HSN on items; GSTIN on org/customer | Master data migration |
| GST Sales (With HSN) | Tax split columns on lines |
| GSTR-1 / GSTR-3B export | Govt schemas, validation, period lock |
| TDS/TCS | Statutory config + deduction on payments |

**Typically:** Separate “Compliance” service or integration with ClearTax / Zoho / Tally export.

### Phase R5 — Accounting suite (**L**, product decision)

Balance Sheet, P&L, Daybook, Cash and Bank, Expense reports → **full accounting** scope; usually a different product or deep Tally integration—not recommended inside OMS without explicit product mandate.

---

## 6. Cross-links to domain reports

| Benchmark area | Detailed analysis |
|----------------|-------------------|
| Sales Summary, bill data | [01-order-management-system.md](./01-order-management-system.md) |
| Returns affecting sales/GST | [02-returns-reverse-logistics.md](./02-returns-reverse-logistics.md) |
| Stock, rate list, item sales | [03-inventory-stock-availability.md](./03-inventory-stock-availability.md) |
| Party, category sales, dashboard | [04-customer-sales-performance.md](./04-customer-sales-performance.md) |
| Godown / warehouse stock | [05-warehouse-distribution-operations.md](./05-warehouse-distribution-operations.md) |

---

## 7. Planning implications

1. **Do not promise GST/TDS reports** on current schema—stakeholders should treat Phase R4 as a separate initiative.
2. **Quick wins** for parity with the benchmark list: Sales register export, godown-wise stock export, category-wise sales export (R1).
3. **“Audit Trail”** in the benchmark aligns with compliance expectations—implement activity logging before claiming audit readiness.
4. **Purchase-side reports** (GSTR-2, Purchase Summary, GST Purchase) require a **purchase/vendor** workstream—not returns alone.
5. Use **warehouse** terminology in UI or add “Godown” alias for users coming from Vyapar/Busy/Tally vocab.

---

*Benchmark list provided by product planning (May 2026). Evidence from om-laravel `routes/api.php`, repositories, and om-ionic dashboard/entity views—no GST/HSN/TDS symbols found in application source.*
