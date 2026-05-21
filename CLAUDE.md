# Order Management Dashboard — Claude Context

### Simplify Order Management Application
- **Frontend**: `/Users/rudransh/Documents/Hardik/om-ionic`
  - Technology: React 19 + TypeScript + Ionic 8, React Router v5, TanStack React Query v5, Axios, Tailwind CSS, Vite
  - Main entry: `src/main.tsx`
  - Key features: Customer management, Item Management, Order Creation, Warehouse management
  
- **Backend**: `/Users/rudransh/Documents/Hardik/order-management`
  - Technology: Laravel API (PHP)
  - API endpoints for football app functionality

## Project

> **Active migration**: Ionic → Pure React (11-phase plan). See `docs/MIGRATION_PLAN.md`.

---

## Dev Commands
```bash
npm run dev        # dev server
npm run build      # production build
npm run typecheck  # type check
npm run lint       # lint
```

---

## Directory Structure
```
src/
├── components/      # UI + domain components; *Modal.tsx files here
├── contexts/        # AuthContext.tsx
├── hooks/           # use*.ts (data), use*Modal.tsx (modal controllers)
├── lib/             # Axios.tsx — singleton with HMAC + Bearer + interceptors
├── pages/           # Route pages by domain
├── providers/       # QueryProvider.tsx (staleTime 5m, gcTime 10m, retry 0)
├── services/        # *Service.ts — typed API functions
├── theme/           # variables.css (Ionic CSS vars — being migrated to Tailwind)
└── types/           # *.ts type definitions
```

---

## Key Architecture Patterns

### Modal | Hook Pattern (STRICT — follow exactly)
Every modal has **exactly 4 props**: `isOpen`, `onClose`, `onEvent`, `data`.
- Hook (`useXxxModal.tsx`): manages promise resolution, passes data through — no business logic
- Modal (`XxxModal.tsx`): manages its own internal state, child modals, and emits typed events
- Consumer: `const result = await openXxx(data)` + renders `<XxxModalView />` in JSX
- Events: discriminated unions — `{ type: 'Selected'; data: {...} } | { type: 'Cancelled' }`
- Child modals are invoked **inside** the modal component, not in the hook or parent
- See `docs/practices.md` for full reference

### React Query Hooks
- Infinite scroll: `useInfiniteQuery` with `getNextPageParam: (page) => page.nextPage`
- Single: `useQuery` with `enabled: id > 0`
- Mutations: always `invalidateQueries` on success
- Query keys: `[QUERY_KEY, ...params]` pattern

### Smart Search Pattern
Field-specific + fuzzy matching + URL state persistence.
- Numeric query → show ID-only options; email query → email option only; text → all
- Fuzzy: `REPLACE(field, " ", "") LIKE ?` on backend
- URL params: `?search=...&search_field=...`
- See `docs/SEARCH_PATTERN.md`

### Segment Slider (Tabbed Forms)
`useSegmentSlider(segments, defaultSegment)` — syncs `IonSegment` ↔ Swiper slides.
- **Migration note**: `onSegmentChange` signature changes from `(event: CustomEvent)` to `(value: string)`

### Axios (`src/lib/Axios.tsx`)
- HMAC signature header (static — flagged for security audit post-migration)
- Bearer token from localStorage
- Global 401 → redirect to login
- `alert()` in error handler → `toast.error()` in Phase 9

---

## Backend Patterns (Laravel)

### Layer Order
Route → Controller → Repository → Model (never skip repository)

### Data Transform Rules
- **FormRequest**: camelCase input → snake_case DB fields + build `metadata` JSON
- **Resource**: snake_case DB → camelCase JSON response
- All main entities: soft deletes (`deleted_at`)
- Metadata: JSON column with model accessors (`$casts = ['metadata' => 'array']`)

### API Response Shapes
```
List:   { items: [...], currentPage: N, nextPage: N|null }
Single: { item: {...}, message?: string }
Error:  { message: string }
```

### Foreign Keys
`id_*` prefix (e.g., `id_author`, `id_post_category`)

### Pivot Tables
`{table1}_{table2}_assigned`

---

## Naming Conventions

| Context | Convention |
|---------|-----------|
| React components / types | `PascalCase` |
| Hooks | `use*` prefix |
| Services | `*Service` suffix |
| Utilities | `camelCase.ts` |
| Laravel models | `PascalCase` singular |
| Laravel tables | `snake_case` singular |
| Laravel columns | `snake_case` |
| API response keys | `camelCase` |

---

## Migration Status (Ionic → Pure React)

Currently in migration. All phases build on Phase 1+2 being done first.

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Bootstrap + deps (no Ionic, add Radix/sonner/RR v6) | — |
| 2 | Routing + shell (`IonSplitPane` → CSS Grid, RR v6) | — |
| 3 | 14 design primitives (Button, Input, Modal, Badge…) | — |
| 4 | Sidebar/nav (`IonMenu` → `<aside>` + Radix Collapsible) | — |
| 5 | 30+ modals (`IonModal` → Radix Dialog) | — |
| 6 | Accordions (3 patterns → Radix Collapsible) | — |
| 7 | Tabs/segments (IonSegment → Radix Tabs + onClick) | — |
| 8a–i | All 91 pages domain by domain | — |
| 9 | `useIonToast` → sonner, `useIonAlert` → `useConfirmDialog` | — |
| 10 | Capacitor decision (keep or remove) | — |
| 11 | Dead code cleanup + hardening | — |

### Do NOT change during migration
- `src/lib/Axios.tsx` — keep as-is
- `src/providers/QueryProvider.tsx` — keep as-is
- All 44 service files — keep as-is
- All 37 type files — keep as-is
- All data-fetching hook logic — keep as-is
- `CartContext.tsx` (1088 lines) — zero Ionic deps, keep entirely
- `OrderDetailContext.tsx` — keep as-is
- `visitedTabs` lazy loading pattern — keep as-is

### Post-migration flags
- Hard-coded RBAC in `Menu.tsx`: `employee.id === 1 || employee.id === 8` → proper RBAC
- Static HMAC in `Axios.tsx` → security audit
- Dead files: `OrderDetail.old.tsx`, `OrderList.old.tsx`, `OrderListIonic.tsx`
- Dead state in `VendorSegment.tsx`: `statusExpanded` + commented accordion block

---

## Adding a New Feature

### Backend (8 files)
1. `database/migrations/…_create_{name}_table.php`
2. `app/Models/{Name}.php`
3. `app/Repositories/{Name}Repository.php`
4. `app/Http/Resources/{Name}Resource.php`
5. `app/Http/Requests/Store{Name}Request.php`
6. `app/Http/Requests/Update{Name}Request.php`
7. `app/Http/Controllers/{Name}Controller.php`
8. Route in `routes/api.php`

### Frontend (7 files)
1. `src/types/{name}.ts`
2. `src/services/{name}Service.ts`
3. `src/hooks/use{Name}s.ts`
4. `src/hooks/use{Name}FormModal.tsx`
5. `src/components/{Name}FormModal.tsx`
6. `src/pages/{name}/{Name}List.tsx`
7. Route in `src/App.tsx` + menu item in `src/components/Menu.tsx`

---

## Authentication
- Backend: Laravel Sanctum, routes at `/api/admin/login|logout|me`
- Frontend: `AuthContext` → `isAuthenticated`, `employee`, `login`, `logout`
- Token: localStorage → Axios interceptor appends Bearer
- Protected routes: `<ProtectedRoute>` wrapper

---

## Docs
- `docs/ARCHITECTURE.md` — full backend patterns with code examples
- `docs/MIGRATION_PLAN.md` — 11-phase Ionic → React migration
- `docs/practices.md` — shared components, hooks, modal/form patterns
- `docs/SEARCH_PATTERN.md` — smart search implementation
- `docs/MODAL_HOOK_PATTERN.md` — modal hook implementation

---

## Claude Tools & Skills
- `/review` — code review pipeline
- `/deploy` — deployment pipeline
- `/test-ssl` — SSL validation
- Agents: `code-reviewer`, `test-writer`, `security-auditor`, `shops-sre`, `frontend-design`, `caveman`
