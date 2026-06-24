# Reporting Database & API — Implementation Plan

**Based on:** [07-reporting-database-architecture.md](./07-reporting-database-architecture.md)  
**Backend:** `om-laravel` · **Frontend:** `om-ionic`  
**Purpose:** Actionable plan to build the reporting schema, ETL, and REST APIs — not migrations themselves.

---

## 1. Executive summary

Doc 07 defines a **classic OLTP + reporting star schema** pattern. Today, `om-laravel` serves analytics by **querying OLTP directly** (`DashboardController`, `*Repository::performance()` with joins on `orders` / `order_details`). That works for small data but will not meet the **&lt; 2s / millions of rows** goal.

**Recommended approach:**

1. Add reporting tables (`rpt_*` prefix for MySQL compatibility, or `rpt` schema on PostgreSQL).
2. Run **incremental ETL** from OLTP → facts → daily summaries.
3. Expose a **unified Reporting API** under `/api/admin/reports/*` while gradually migrating dashboard and entity `performance` endpoints to read summaries.

**Do not** build GST/ledger reports until OLTP fixes in [01](./01-system.md) / [02](./02-returns-reverse-logistics.md) and schema in [06](./06-reporting-compliance-benchmark.md).

---

## 2. Current state analysis

### 2.1 What exists today

| Capability | Implementation | Limitation |
|------------|----------------|------------|
| Dashboard KPIs | `GET /admin/dashboard` — aggregates `orders`, `warehouse_details` | No `organisation_id` filter; scans OLTP |
| Entity performance | `GET /admin/{entity}/{uuid}/performance?range=week` | Per-entity custom SQL; duplicated logic |
| Item analytics | `GET /admin/items/{uuid}/sales-stats`, `stock-levels` | OLTP joins |
| Warehouse stock | `GET /admin/warehouses/{uuid}/stock` | Point-in-time OLTP only |
| Saved reports / exports | None | — |
| ETL / facts | None | — |

### 2.2 Gap vs doc 07

| Doc 07 component | Status |
|----------------|--------|
| `dim_date` | Missing |
| `fact_order_lines` | Missing |
| `summary_sales_daily` | Missing |
| Dimension sync (`dim_customer`, etc.) | Missing |
| `report_definitions` + saved views | Missing |
| Export queue + `report_runs` | Missing |
| Redis cache layer | Not used for reports |
| Read replica | Infra not defined |

### 2.3 Technical decisions (choose before coding)

| Decision | Recommendation | Rationale |
|----------|----------------|-----------|
| DB engine | Confirm prod DB (MySQL vs PostgreSQL) | PG: schema `rpt` + mat views; MySQL: `rpt_` table prefix only |
| Phase 1 location | **Same database** as OLTP | Faster delivery; replica in P3 |
| Table naming | `rpt_fact_order_lines` (works everywhere) | Laravel migrations without schema quirks |
| Surrogate keys | `bigint` auto-increment on dims/facts | ETL upsert by natural key `(organisation_id, order_line_id)` |
| Tenant scope | `organisation_id` on every row | Match `orders.organisation_id`; add to dashboard queries |
| Migrate dashboard | Phase 1b after first ETL backfill | Avoid dual sources of truth long-term |

---

## 3. How to create the database structure

### 3.1 Migration order (dependencies)

Execute in this order to satisfy FKs and seed data:

```
Phase DB-0 — Metadata (can ship with API P2)
  1. report_definitions
  2. report_saved_views
  3. report_schedules
  4. report_runs
  5. report_export_files
  6. report_role_permissions
  7. etl_watermarks (organisation_id, pipeline, last_synced_at)

Phase DB-1 — Core reporting (P0)
  8.  rpt_dim_date                    (+ seeder: 2010-01-01 → 2035-12-31)
  9.  rpt_dim_organisation
  10. rpt_dim_customer
  11. rpt_dim_salesman
  12. rpt_dim_route
  13. rpt_dim_area
  14. rpt_dim_brand
  15. rpt_dim_category
  16. rpt_dim_item
  17. rpt_dim_warehouse
  18. rpt_fact_orders
  19. rpt_fact_order_lines            ← primary analytics table
  20. rpt_summary_sales_daily
  21. rpt_summary_sales_daily_customer   (optional P0.5)
  22. rpt_summary_sales_daily_salesman
  23. rpt_summary_sales_daily_category

Phase DB-2 — Returns & inventory (P1)
  24. rpt_fact_return_lines
  25. rpt_summary_returns_daily
  26. rpt_fact_stock_snapshot
  27. rpt_summary_stock_current
  28. rpt_summary_low_stock

Phase DB-3 — Scale (P3)
  29. Partitioning on rpt_fact_order_lines (by date_key)
  30. Read replica connection in config
```

### 3.2 Minimal P0 table DDL sketch (Laravel migration friendly)

**`rpt_dim_date`** — seeded once:

- PK: `date_key` (int, e.g. `20260520`)
- `full_date`, `year`, `quarter`, `month`, `week`, `year_month`, `day_of_week`, `is_weekend`

**`rpt_dim_customer`** (pattern for all dims):

- `customer_key` (id), `customer_id`, `organisation_id`, `uuid`, `code`, `name`, `salesman_id`, `is_current`, `source_updated_at`
- Unique: `(organisation_id, customer_id, is_current)` or SCD2 with `valid_from`/`valid_to`

**`rpt_fact_order_lines`**:

- Natural key unique index: `(organisation_id, order_line_id)`
- Columns: dims as `*_key`, denormalized `item_code`, `item_name`, `order_code`, `quantity`, `unit_price`, `total`, `tax_amount`, `discount_amount`, `current_status`, `is_deleted`, `date_key`, `order_uuid` (for drill-through)

**`rpt_summary_sales_daily`**:

- Unique: `(organisation_id, summary_date)`
- Metrics: `order_count`, `line_count`, `units_sold`, `gross_sales`, `net_sales`, `tax_total`, `discount_total`, `refreshed_at`

### 3.3 ETL pipelines (how data gets into reporting tables)

```text
┌─────────────────────────────────────────────────────────────────┐
│  Trigger: Scheduler + optional manual artisan                    │
└─────────────────────────────────────────────────────────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     ▼                        ▼                        ▼
 SyncDimensions          SyncFactOrderLines      RebuildSummaries
 (customers, items…)    (incremental watermark)  (upsert by day)
     │                        │                        │
     └────────────────────────┴────────────────────────┘
                              ▼
                    etl_watermarks updated
                    Cache::tags(['org:{id}'])->flush()
```

#### Pipeline A: `SyncDimensions`

- **Input:** OLTP `customers`, `salesmans`, `items`, `brands`, `categories`, `routes`, `areas`, `warehouse`, `organisations`
- **Logic:** Upsert current row per entity (`is_current = true`); optional SCD2 later
- **Frequency:** Every 15–60 min, or on-demand before fact sync

#### Pipeline B: `SyncFactOrderLines` (critical)

- **Watermark:** `etl_watermarks` where `pipeline = 'fact_order_lines'` — store `last_source_updated_at`
- **Query OLTP:**

```sql
SELECT o.*, od.*, i.brand_id, i.category_id
FROM order_details od
JOIN orders o ON o.id = od.order_id
LEFT JOIN items i ON i.id = od.item_id
WHERE o.updated_at > :watermark OR od.updated_at > :watermark
```

- **Transform:**
  - Resolve `customer_key`, `item_key`, etc. from dim tables (or embed ids + join at query time in phase 1)
  - `date_key = YYYYMMDD` from `o.order_date`
  - `is_deleted = o.deleted_at IS NOT NULL`
  - `tax_amount = total - net_price` (or from line fields)
- **Load:** `upsert` on `(organisation_id, order_line_id)`
- **Frequency:** Every 5 min for near-real-time; nightly full reconcile last 7 days

#### Pipeline C: `RebuildSummarySalesDaily`

- **Input:** `rpt_fact_order_lines` grouped by `organisation_id`, `date_key`
- **Metrics:** per doc 07 semantic layer
- **Load:** upsert `rpt_summary_sales_daily`
- **Frequency:** After each fact sync batch; nightly full rebuild

#### Pipeline D: `StockSnapshot` (P1)

- Nightly copy `warehouse_details` → `rpt_fact_stock_snapshot` for `snapshot_date = today`
- Refresh `rpt_summary_stock_current` and `rpt_summary_low_stock`

### 3.4 Laravel artifacts for database layer

```text
om-laravel/
  database/migrations/reporting/     # ordered migrations above
  database/seeders/RptDimDateSeeder.php
  app/Models/Reporting/
    RptDimDate.php
    RptFactOrderLine.php
    RptSummarySalesDaily.php
    ReportDefinition.php
    ...
  app/Models/Reporting/Concerns/
    BelongsToOrganisation.php        # global scope
  config/database.php
    connections.reporting => same as mysql/pgsql default (phase 1)
```

**Model config:**

```php
protected $connection = 'reporting';
protected $table = 'rpt_fact_order_lines';
```

### 3.5 Initial backfill (one-time)

```bash
php artisan reporting:seed-dim-date
php artisan reporting:sync-dimensions --full
php artisan reporting:sync-fact-order-lines --full   # all history
php artisan reporting:rebuild-summaries --from=2020-01-01
php artisan reporting:control-totals                 # compare OLTP vs facts
```

---

## 4. How to create the API

### 4.1 API design principles

1. **One filter contract** for all reports (doc 07 §10).
2. **Never accept raw SQL** from client — whitelist dimensions/metrics per `report_definitions`.
3. **organisation_id** from `auth()->user()->organisation_id`, never from request body.
4. **Paginate** grids; **async** exports.
5. **CamelCase JSON** responses (match om-ionic conventions).

### 4.2 Route structure

Add under existing Sanctum group in `routes/api.php`:

```php
Route::prefix('reports')->group(function () {
    // Catalog
    Route::get('/', [ReportCatalogController::class, 'index']);
    Route::get('{slug}', [ReportCatalogController::class, 'show']);

    // Run report (sync — KPIs, charts, paginated data)
    Route::post('{slug}/query', [ReportQueryController::class, 'execute']);

    // Saved views (Favourites)
    Route::get('views', [ReportSavedViewController::class, 'index']);
    Route::post('views', [ReportSavedViewController::class, 'store']);
    Route::put('views/{uuid}', [ReportSavedViewController::class, 'update']);
    Route::delete('views/{uuid}', [ReportSavedViewController::class, 'destroy']);

    // Exports (async)
    Route::post('{slug}/export', [ReportExportController::class, 'store']);
    Route::get('runs/{uuid}', [ReportRunController::class, 'show']);
    Route::get('runs/{uuid}/download', [ReportExportController::class, 'download']);

    // Schedules (P2)
    Route::apiResource('schedules', ReportScheduleController::class);
});
```

**Full paths:** `/api/admin/reports/...`

### 4.3 Report catalog (`report_definitions` seed)

| slug | name | base table | Maps to report doc |
|------|------|------------|-------------------|
| ` | Order Management | `rpt_fact_order_lines` | 01 |
| `returns-logistics` | Returns & Reverse Logistics | `rpt_fact_return_lines` | 02 |
| `inventory-stock` | Inventory & Stock | `rpt_summary_stock_current` | 03 |
| `customer-sales` | Customer & Sales Performance | `rpt_summary_sales_daily_customer` | 04 |
| `warehouse-operations` | Warehouse & Distribution | `rpt_fact_stock_snapshot` | 05 |

### 4.4 Request: `POST /admin/reports/{slug}/query`

**Body (validated by `ReportQueryRequest`):**

```json
{
  "dateRange": {
    "from": "2026-01-01",
    "to": "2026-05-20",
    "compareTo": "previous_period"
  },
  "dimensions": {
    "customerUuids": [],
    "salesmanUuids": [],
    "routeUuids": [],
    "categoryUuids": [],
    "brandUuids": [],
    "warehouseUuids": [],
    "status": ["delivered", "shipped"]
  },
  "metrics": ["netSales", "orderCount", "unitsSold"],
  "groupBy": ["summaryDate"],
  "pagination": { "page": 1, "perPage": 50 },
  "sort": [{ "field": "netSales", "direction": "desc" }]
}
```

**Resolution steps in `ReportQueryController`:**

1. Load `report_definitions` by `slug`; check `report_role_permissions`.
2. Map UUIDs → surrogate keys via OLTP or dim tables (cached).
3. Convert dates → `date_key` range.
4. **Route query:**
   - If `groupBy` is date-only and metrics are standard → `rpt_summary_sales_daily`
   - Else if line-level columns requested → `rpt_fact_order_lines` with pagination
5. Apply Redis cache: `report:{slug}:{orgId}:{hash(filters)}` TTL 5–10 min.
6. Return `ReportQueryResource`.

### 4.5 Response shape (align with om-ionic)

**KPI / chart response:**

```json
{
  "success": true,
  "data": {
    "meta": {
      "reportSlug": ",
      "dateRange": { "from": "2026-01-01", "to": "2026-05-20" },
      "refreshedAt": "2026-05-20T10:05:00Z",
      "source": "summary"
    },
    "kpis": {
      "netSales": 125000.50,
      "orderCount": 342,
      "unitsSold": 1890,
      "avgOrderValue": 365.50
    },
    "series": [
      { "label": "2026-05-01", "netSales": 4200, "orderCount": 12 }
    ],
    "comparison": {
      "previousNetSales": 118000,
      "changePercent": 5.9
    }
  }
}
```

**Paginated grid response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "orderUuid": "...",
        "orderCode": "ORD-001",
        "orderDate": "2026-05-15",
        "customerName": "Shop A",
        "itemName": "Widget",
        "quantity": 10,
        "total": 1500.00
      }
    ],
    "meta": {
      "currentPage": 1,
      "lastPage": 5,
      "perPage": 50,
      "total": 230
    }
  }
}
```

### 4.6 Export API

**`POST /admin/reports/{slug}/export`**

```json
{
  "format": "csv",
  "dateRange": { "from": "2026-01-01", "to": "2026-05-20" },
  "dimensions": {},
  "columns": ["orderCode", "orderDate", "customerName", "itemName", "quantity", "total"]
}
```

**Flow:**

1. Create `report_runs` (status `pending`).
2. Dispatch `GenerateReportExportJob` on queue `reports`.
3. Return `{ "runUuid": "...", "status": "pending" }`.
4. Job streams fact query → CSV → S3 → update run → optional notification.
5. Client polls `GET /admin/reports/runs/{uuid}` until `completed`, then download URL.

### 4.7 Laravel application structure

```text
app/
  Http/
    Controllers/Reporting/
      ReportCatalogController.php
      ReportQueryController.php
      ReportSavedViewController.php
      ReportExportController.php
      ReportRunController.php
    Requests/Reporting/
      ReportQueryRequest.php
      ReportExportRequest.php
      StoreReportSavedViewRequest.php
    Resources/Reporting/
      ReportQueryResource.php
      ReportDefinitionResource.php
      ReportRunResource.php
  Repositories/Reporting/
    ReportQueryRepository.php      # slug → query builder
    ReportCatalogRepository.php
    ReportSavedViewRepository.php
  Services/Reporting/
    MetricRegistry.php             # netSales, orderCount definitions
    ReportFilterResolver.php       # UUIDs → keys, date_key
    ReportCacheService.php
    Etl/
      SyncDimensionsService.php
      SyncFactOrderLinesService.php
      RebuildSummariesService.php
      ControlTotalsService.php
  Jobs/Reporting/
    GenerateReportExportJob.php
  Console/Commands/Reporting/
    ReportingSyncFactOrderLinesCommand.php
    ReportingRebuildSummariesCommand.php
    ReportingControlTotalsCommand.php
```

### 4.8 Relation to existing endpoints

| Existing | Migration strategy |
|----------|-------------------|
| `GET /admin/dashboard` | Phase 1b: switch `dailySales` / stats to `rpt_summary_sales_daily`; fix `totalReturns` via `rpt_summary_returns_daily` |
| `GET /admin/customers/{uuid}/performance` | Keep route; internally call `ReportQueryRepository` with fixed `customerUuid` filter OR read summary by customer_key |
| Item `sales-stats` | P1: optional redirect to `inventory-stock` report query |
| New Reports UI page | `POST /reports/{slug}/query` + saved views |

**Avoid** duplicating SQL in 6 repositories — extract shared `SalesMetricsService` fed by reporting tables.

---

## 5. Frontend integration (om-ionic)

### 5.1 New modules (minimal)

```text
src/
  types/reporting.ts
  services/reportingService.ts
  hooks/useReportQuery.ts          # useQuery / useMutation
  hooks/useReportExport.ts
  hooks/useReportSavedViews.ts
  pages/reports/
    ReportCatalogPage.tsx          # list report_definitions
    ReportRunnerPage.tsx           # filters + chart + grid
    ReportExportsPage.tsx          # run history
```

### 5.2 Service example

```typescript
// POST /api/admin/reports/query
export async function queryReport(slug: string, payload: ReportQueryPayload) {
  const { data } = await api.post(`/admin/reports/${slug}/query`, payload);
  return data;
}
```

### 5.3 UX features mapped to API

| Feature | API |
|---------|-----|
| Favourite | `report_saved_views.is_favourite` |
| Saved filters | `POST/PUT views` with `filterPayload` |
| Date comparison | `dateRange.compareTo` in query |
| Drill-down | Grid row `orderUuid` → navigate `/orders/edit/:id` |
| CSV export | `POST export` + poll run |

---

## 6. Phased delivery plan

### Sprint 0 — Prerequisites (1 week)

- [ ] Confirm MySQL vs PostgreSQL in production
- [ ] Fix P0 OLTP: order stock on edit, return restock (or document exclusions in ETL)
- [ ] Add `organisation_id` scoping to `DashboardController`

### Sprint 1 — Database P0 (2 weeks)

- [ ] Migrations: `rpt_dim_date` + seeder
- [ ] Migrations: dims (customer, item, salesman, route, brand, category, warehouse, organisation)
- [ ] Migrations: `rpt_fact_order_lines`, `rpt_fact_orders`, `rpt_summary_sales_daily`
- [ ] `etl_watermarks` table
- [ ] Eloquent models + `OrganisationScope`

### Sprint 2 — ETL P0 (1–2 weeks)

- [ ] `SyncDimensionsService`
- [ ] `SyncFactOrderLinesService` (incremental + full)
- [ ] `RebuildSummariesService`
- [ ] Scheduler: every 5 min + nightly reconcile
- [ ] `reporting:control-totals` command + log warnings

### Sprint 3 — API P0 (1–2 weeks)

- [ ] Seed `report_definitions` (5 slugs)
- [ ] `ReportQueryRequest` + `ReportQueryRepository`
- [ ] `POST reports/{slug}/query` for ` + `customer-sales`
- [ ] Redis cache wrapper
- [ ] PHPUnit: tenant isolation, date filter required, metric accuracy vs OLTP sample

### Sprint 4 — API P1 + exports (2 weeks)

- [ ] Returns + stock snapshots ETL
- [ ] Reports: `returns-logistics`, `inventory-stock`, `warehouse-operations`
- [ ] `report_runs` + export job + download endpoint
- [ ] Saved views CRUD

### Sprint 5 — Frontend + dashboard migration (2 weeks)

- [ ] Report runner page
- [ ] Migrate dashboard charts to reporting API
- [ ] Deprecate duplicate OLTP aggregates in repositories (optional)

### Later — P3+ infra

- [ ] Read replica + `connections.reporting`
- [ ] Partitioning
- [ ] Scheduled email reports
- [ ] GST columns + compliance reports ([06](./06-reporting-compliance-benchmark.md))

---

## 7. Testing & acceptance criteria

| Test | Pass criteria |
|------|----------------|
| Control totals | `ABS(oltp_net - fact_net) < 0.01` per org per day |
| Tenant isolation | Org A cannot see Org B rows |
| Performance | `POST .../query` p95 &lt; 2s for 90-day summary on 100k fact rows |
| Export | 50k row CSV completes without memory error |
| Soft delete | Deleted order lines excluded from `is_deleted = false` queries |
| Idempotent ETL | Running sync twice produces same row counts |

---

## 8. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| OLTP bugs distort facts | Fix stock/return logic first; control totals job |
| Dual dashboard sources | Migrate dashboard in same sprint as ETL go-live |
| UUID → key mapping slow | Cache dim lookups in Redis per org |
| Over-scoping P0 | Ship only ` + daily summary before 5 report UIs |
| MySQL no mat views | Use summary tables only |

---

## 9. Quick reference — what to build first

**Minimum viable reporting (2–3 sprints):**

1. Tables: `rpt_dim_date`, `rpt_fact_order_lines`, `rpt_summary_sales_daily`, `etl_watermarks`
2. Commands: sync facts + rebuild summaries
3. API: `POST /admin/reports/query`
4. Wire dashboard `dailySales` to summary table

Everything else in doc 07 builds on this foundation.

---

*Companion to [07-reporting-database-architecture.md](./07-reporting-database-architecture.md) · v1.0 · May 2026*
