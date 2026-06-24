# SaaS Platform Analysis Reports

Read-only audits of the Order Management admin application. Source brief: [Report_context.md](../Report_context.md).

**Scope:** Frontend [om-ionic](https://github.com/) (`src/pages`, hooks, services) · Backend [om-laravel](/Users/rudransh/Documents/Hardik/om-laravel) (`routes/api.php`, repositories, resources).

| Report | File | Focus |
|--------|------|--------|
| 1 | [01-system.md](./01-system.md) | Orders, line items, stock deduction, transaction UX |
| 2 | [02-returns-reverse-logistics.md](./02-returns-reverse-logistics.md) | Returns lifecycle, inventory reversal gaps |
| 3 | [03-inventory-stock-availability.md](./03-inventory-stock-availability.md) | Items, UOM, brands/categories, stock APIs |
| 4 | [04-customer-sales-performance.md](./04-customer-sales-performance.md) | CRM, salesman, geo analytics, dashboard |
| 5 | [05-warehouse-distribution-operations.md](./05-warehouse-distribution-operations.md) | Warehouses, areas, routes, distribution hierarchy |
| 6 | [06-reporting-compliance-benchmark.md](./06-reporting-compliance-benchmark.md) | ERP-style report catalog (GST, party, stock, P&L) vs current OMS |
| 7 | [07-reporting-database-architecture.md](./07-reporting-database-architecture.md) | Reporting DB schema: star schema, ETL, indexes, caching, multi-tenant |
| 8 | [08-reporting-implementation-plan.md](./08-reporting-implementation-plan.md) | Step-by-step plan: migrations, ETL, REST API, frontend wiring |

**Generated:** May 2026 · Reports 01–08 are planning/audit docs.

**Implemented (om-laravel P0):** Reporting schema, ETL commands, REST API (`/api/admin/reports/*`), dashboard summary fallback, `reportingService.ts` on frontend. See setup below.

### Report catalog benchmark

If planning includes standard accounting/inventory reports (GSTR-1, party ledger, stock summary godown-wise, ageing, etc.), see **report #6** for a line-by-line gap matrix and phased roadmap (R1–R5).

For **database design** (fact/dimension tables, materialized views, partitioning, Laravel ETL, Redis, exports), see **report #7**. For **how to build it** (migration order, API routes, sprints), see **report #8**.

### Reporting stack setup (after deploy)

```bash
cd om-laravel
php artisan migrate
php artisan reporting:seed-dim-dates
php artisan db:seed --class=ReportDefinitionSeeder
php artisan reporting:sync-all --full
```

**API (Sanctum):**

- `GET /api/admin/reports` — catalog
- `POST /api/admin/reports/query` — KPIs + series
- `GET|POST|DELETE /api/admin/reports/views` — saved views

**Scheduler:** `reporting:sync-all` every 5 minutes (see `routes/console.php`).
