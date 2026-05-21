# Ionic → Pure React Migration Plan

## Project Facts (Migration Surface)

| Item | Count |
|---|---|
| TSX source files | 186 |
| Pages | 91 |
| Custom hooks | 100+ |
| Service files | 44 |
| TypeScript type files | 37 |
| Modal components | 30+ |
| IonAccordion usages | 10 files |

### Ionic Components to Replace

`IonApp` · `IonSplitPane` · `IonMenu` · `IonPage` · `IonContent` · `IonHeader` · `IonToolbar` · `IonFooter` · `IonList` · `IonItem` · `IonAccordion` · `IonAccordionGroup` · `IonSegment` · `IonSegmentButton` · `IonModal` · `IonAlert` · `IonToast` · `IonSelect` · `IonInput` · `IonTextarea` · `IonButton` · `IonIcon` · `IonBadge` · `IonChip` · `IonLoading` · `IonInfiniteScroll` · `IonRefresher`

### Keep As-Is (No Ionic Dependency)

- Axios singleton (`src/lib/Axios.tsx`) — HMAC signature, Bearer token, global error interceptor
- TanStack Query v5 (`src/providers/QueryProvider.tsx`) — staleTime 5m, gcTime 10m, retry 0
- Tailwind CSS — enable preflight now that Ionic is removed
- All 44 service files
- All 37 type files
- All 100+ custom hooks (data fetching logic only; UI state hooks need minor updates)
- `CartContext.tsx` (1088 lines, 20+ useState) — pure React, zero Ionic dependency
- `OrderDetailContext.tsx` — pure React context
- `useSegmentSlider` hook — only needs event signature update (Phase 7)
- `visitedTabs` lazy loading pattern — pure React state

---

## Critical Path

```
Ph 1 (Bootstrap) → Ph 2 (Routing/Shell) → Ph 3 (Design Primitives)
                                                        ↓
                              Ph 4 (Nav) ←──────────────┤
                              Ph 5 (Modals) ←───────────┤  (run parallel)
                              Ph 6 (Accordion) ←────────┤
                              Ph 7 (Tabs) ←─────────────┘
                                        ↓
                              Ph 8a–c (Simple pages)
                              Ph 8d–f (Complex pages)
                              Ph 8g–h (Admin/SOP)
                                        ↓
                              Ph 9 (Notifications) → Ph 10 (Capacitor) → Ph 11 (Cleanup)
```

---

## Phase 1 — Project Bootstrap & Dependency Swap

**Goal**: New Vite + React 19 + TypeScript project with same tooling, zero Ionic.

### Actions

1. Create new Vite project (`react-ts` template)
2. Copy over verbatim:
   - `src/types/`
   - `src/services/`
   - `src/lib/Axios.tsx`
   - `src/providers/QueryProvider.tsx`
   - `src/constants/`
   - `src/contexts/AuthContext.tsx`
3. Install dependencies:
   ```
   react-router-dom@6
   @tanstack/react-query@5
   axios
   tailwindcss
   swiper
   @mdi/js
   react-phone-input-2
   sonner (replaces useIonToast)
   @radix-ui/react-dialog
   @radix-ui/react-collapsible
   @radix-ui/react-tabs
   ```
4. Enable Tailwind preflight — remove `corePlugins: { preflight: false }` (Ionic no longer conflicts)
5. Migrate brand tokens from `src/theme/variables.css` → Tailwind `theme.extend.colors`:
   ```js
   primary: { 500: '#df3226' }  // was --ion-color-primary
   ```
6. Set `darkMode: 'class'` in Tailwind config — replace Ionic's `@ionic/react/css/palettes/dark.system.css` with a `ThemeProvider` toggle

**Deliverable**: Compilable shell. All types/services/API layer intact. No UI yet.

---

## Phase 2 — Routing & Shell Layout

**Goal**: Replace `IonApp → IonReactRouter → IonSplitPane → IonMenu` with pure React equivalents.

### Component Mapping

| Ionic | Pure React |
|---|---|
| `IonApp` | `<div id="app">` root div |
| `IonReactRouter` | `<BrowserRouter>` (React Router v6) |
| `IonSplitPane when={'md'}` | CSS Grid `grid-cols-[240px_1fr]` with `md:` breakpoint |
| `IonMenu` | `<aside>` with responsive show/hide |
| `IonRouterOutlet` | `<Routes>` with `<Outlet>` |
| `ProtectedRoute` | Keep pattern, update for RR v6 (no `<Redirect>`, use `<Navigate>`) |

### Routing Changes

- React Router v5 `Switch/Route/Redirect` → v6 `Routes/Route/Navigate`
- 40+ routes: migrate 1-for-1, same paths
- `DRAWER_ONLY_ROUTES = ['/orders', '/order']` logic: replace `IonSplitPane when={false}` with CSS class toggled via `useLocation()` — hide sidebar for `/orders` and `/order/*` paths

### Layout Shell

```
AppShell
├── <aside> Sidebar (hidden on /orders/* via useLocation check)
│   └── Navigation (Phase 4)
└── <main> (replaces IonContent — scrollable div, overflow-y-auto)
    └── <Outlet />
```

**Auth flow**: Login page bypasses shell entirely — same pattern as before, now using React Router v6 layout routes.

---

## Phase 3 — Design System Primitives

**Goal**: Build ~14 reusable UI primitives that replace Ionic components. Unblocks all page migrations.

### Priority Order (most-used first)

| Primitive | Replaces | Key Notes |
|---|---|---|
| `<Button>` | `IonButton` | variants: fill/outline/ghost; color; loading spinner state |
| `<Input>` | `IonInput` + `IonInputWrapper.tsx` | controlled; label; error message; `forwardRef` |
| `<Textarea>` | `IonTextarea` | same pattern as Input |
| `<Select>` | `IonSelect` + `IonSelectOption` | native `<select>` or `react-select` for searchable |
| `<Card>` | `IonCard/IonCardContent/IonCardHeader` | `<div>` with border/shadow; `<CardHeader>`, `<CardContent>` sub-components |
| `<ListItem>` | `IonItem` | flex row; label + detail slots |
| `<Badge>` | `IonBadge` | inline `<span>` with color variants |
| `<Chip>` | `IonChip` | pill-shaped tag with optional remove button |
| `<Spinner>` | `IonLoading` / `IonSpinner` | CSS animation or lucide-react `Loader` icon |
| `<Icon>` | `IonIcon` + ionicons | wrap `@mdi/js` paths in `<svg>` renderer |
| `<Toast>` | `useIonToast` | `sonner` — single provider at app root |
| `<Alert>` | `IonAlert` | Radix `<Dialog>` based confirmation modal |
| `<PhoneInput>` | `PhoneInput.tsx` wrapper | keep `react-phone-input-2`; replace IonInput trigger |
| `<DatePicker>` | `DateOnlyPicker.tsx` | keep date logic; replace IonInput display trigger |

### Styling

All primitives use Tailwind utility classes. No Ionic CSS variables. Dark mode via `dark:` prefix with class strategy.

---

## Phase 4 — Navigation / Sidebar

**Goal**: Recreate `Menu.tsx` (route-driven accordion nav, 5 sections) without Ionic.

### Component Mapping

| Ionic | Pure React |
|---|---|
| `IonAccordionGroup value={isActive ? 'x' : undefined}` | Radix `<Collapsible open={isActive}>` |
| `IonMenuToggle autoHide={false}` | `onClick` nav link closes mobile sidebar via context |
| `IonIcon + IonLabel` | `<Icon>` primitive + `<span>` |
| `IonContent` (scrollable) | `<nav>` with `overflow-y-auto h-full` |
| `IonFooter` logout | Sticky `<div>` at bottom of flex-col sidebar |

### Route-Driven Accordion Pattern

```tsx
// open prop derived from useLocation — no useState needed
<SidebarSection open={location.pathname.startsWith('/catalog')}>
  <SidebarSectionHeader icon={...} label="Catalog" />
  <SidebarSectionContent>
    {catalogItems.map(item => <NavLink key={item.path} to={item.path} />)}
  </SidebarSectionContent>
</SidebarSection>
```

Multiple sections can be open simultaneously (independent `<Collapsible>` per section — matches current Ionic behavior where each IonAccordionGroup is independent).

### Mobile Sidebar

Add `isSidebarOpen` boolean to a `UIContext`. Sidebar uses `translate-x-0` / `-translate-x-full` CSS transition. `<SidebarToggle>` button in mobile header fires the context toggle.

### Role-Based Access

`Bank Reconciliation` item currently hard-coded to `employee.id === 1 || employee.id === 8` in `Menu.tsx`. Flag for proper RBAC implementation post-migration.

---

## Phase 5 — Modal System

**Goal**: Replace 30+ `IonModal` components and their paired hooks.

### Architecture (Already Framework-Agnostic)

Each modal follows the pattern: `ComponentModal.tsx` + `useComponentModal.tsx`. The hook manages `isOpen` + form state + API calls. **This pattern requires no changes** — only the modal wrapper itself changes.

### Build One `<Modal>` Primitive

```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Add Company">
  {/* same modal body as before */}
</Modal>
```

Uses Radix `<Dialog>` for accessibility (focus trap, Escape key, aria-modal). Replaces `IonModal` shell + `IonHeader/IonToolbar/IonButtons/IonTitle`.

### Modal Interior Mapping

| Ionic | Pure React |
|---|---|
| `IonModal isOpen={...} onDidDismiss={...}` | `<Modal isOpen={...} onClose={...}>` |
| `IonHeader > IonToolbar > IonTitle` | `<ModalHeader title="...">` |
| `IonContent` (scrollable body) | `<div className="overflow-y-auto p-4">` |
| `IonButtons slot="end"` close button | `<button>` in ModalHeader |
| `IonFooter` action buttons | `<ModalFooter>` with `<Button>` row |

### Migration Order (simple → complex)

1. Selection modals — read-only search lists (CustomerSelectModal, CompanySelectModal, AddressSelectModal)
2. Form modals — single-form (AddCompanyModal, CardFormModal, JobOpeningFormModal)
3. Multi-step modals — (CombinationModal: AttributeSelectionStep → CombinationDetailsForm)

---

## Phase 6 — Accordion Components

**Goal**: Replace all 10 `IonAccordion` usages. Three patterns, one primitive.

### Build `<Accordion>` Primitive

Use Radix `<Collapsible>` for animation + a11y (handles `aria-expanded`, `aria-controls`, keyboard navigation automatically).

```tsx
<Accordion open={isOpen} onOpenChange={setIsOpen}>
  <AccordionTrigger>Header content</AccordionTrigger>
  <AccordionContent>Body content</AccordionContent>
</Accordion>
```

### Three Patterns → Migrations

**Pattern 1 — Route-driven** (`Menu.tsx`):
- Before: `IonAccordionGroup value={isCatalogActive ? "catalog" : undefined}` (no state, no handler)
- After: `<Accordion open={location.pathname.startsWith('/catalog')}>` — pure prop, no state

**Pattern 2 — Boolean state** (`VendorSegment.tsx`, `SOPChecklist.tsx`, `TaxSection.tsx`):
- Before: `value={isOpen ? "key" : undefined}` + `onIonChange={e => setIsOpen(e.detail.value === "key")}`
- After: `<Accordion open={isOpen} onOpenChange={setIsOpen}>` — direct boolean binding

**Pattern 3 — Uncontrolled** (`OrderUtmCard.tsx`):
- Before: `IonAccordionGroup` with no `value` or `onIonChange` (Ionic manages state internally)
- After: `<Accordion>` with no open/onOpenChange props (Radix Collapsible manages state internally)

### Notes

- All current accordions are single-panel per group — no multi-open state needed
- All use `slot="header"` on IonItem and `slot="content"` on a `<div>` → maps to `<AccordionTrigger>` / `<AccordionContent>`
- `SOPChecklist.tsx` accordion header shows progress badge (`7/10`) + status icon — keep that logic, just change the wrapper
- `VendorSegment.tsx` has dead code: commented-out vendor status accordion + unused `statusExpanded` state — remove in Phase 11

---

## Phase 7 — Tab / Segment Components

**Goal**: Replace `IonSegment/IonSegmentButton` + Swiper slide sync pattern used in `CustomerSegment`, `CompanySegment`, `VendorSegment`.

### Component Mapping

| Ionic | Pure React |
|---|---|
| `IonSegment onIonChange` | `<TabList>` with `onClick` handlers |
| `IonSegmentButton value="..."` | `<TabButton>` — `<button>` with active state styling |
| Swiper slides | Keep Swiper; only event wiring changes |

### `useSegmentSlider` Hook Changes

Current: `onSegmentChange` reads `event.detail.value` (Ionic custom event format).
After: change signature to accept `value: string` directly from onClick:

```ts
// Before
function onSegmentChange(event: CustomEvent) {
  setSegment(event.detail.value)
  ...
}

// After
function onSegmentChange(value: string) {
  setSegment(value)
  ...
}
```

All Swiper synchronization logic (`slideTo`, `onSlideChange`, `setSwiper`) is unchanged.

### visitedTabs Lazy Loading

Keep exactly as-is — pure React state (`useState<Set<string>>`). No Ionic dependency. Pattern:
- `enabled: isActive && visitedTabs.has(tabName)` on TanStack Query calls
- `Orders` tab pre-loaded in initial Set
- `visitedTabs` updated on both tab click and Swiper slide change

### CompanyDetail Tabs (`IonTabs/IonTabBar`)

Replace with Radix `<Tabs>` — URL-reflected tab state via `useSearchParams`:
```
/companies/123?tab=customers
```

---

## Phase 8 — Page Migrations

**Goal**: Migrate 91 pages domain-by-domain.

### 8a — Auth

Files: `Login.tsx`

Simplest migration — swap `IonPage/IonContent/IonInput/IonButton`. No business logic changes. All auth state in `AuthContext.tsx` is unchanged.

### 8b — List Pages

Files: `OrderList`, `CustomerList`, `CompanyList`, `ProductList`, `EmployeeList`, and 15+ others.

- Replace `IonList/IonItem` rows with `<table>` or TanStack Table
- `OrderTable.tsx` (already a table component) — minimal changes
- `IonInfiniteScroll` → `useIntersectionObserver` hook on a sentinel div for infinite scroll
- `IonRefresher` → refetch button or pull-to-refresh gesture
- `OrderListMobile.tsx` and `OrderListCards.tsx` — evaluate if both are needed post-migration; likely consolidate into one responsive component

### 8c — Simple Form Pages

Files: `CustomerForm`, `EmployeeForm`, `ProductForm`, `WarehouseForm`.

Swap Ionic form inputs for `<Input>/<Select>/<Textarea>` primitives from Phase 3. Keep all mutation hooks and validation logic unchanged.

### 8d — Company / Customer Detail (Tabbed)

Files: `CompanyDetail.tsx` with tabs `CompanyAddresses`, `CompanyCustomers`, `CompanyInfo`.

Use Radix `<Tabs>` (Phase 7). Tab content components are mostly data display — swap `IonCard/IonList/IonItem` for primitives.

### 8e — Order Segments (Customer/Company tabs inside OrderDetail)

Files: `CustomerSegment.tsx`, `CompanySegment.tsx`.

- Apply Phase 7 tab migration
- Keep `visitedTabs` lazy loading pattern
- Keep Google Maps deep link: `maps.google.com/?q=` on address
- Keep `navigator.clipboard.writeText` + toast for address copy
- Replace `useIonToast` with `sonner` (Phase 9)

### 8f — OrderDetail (Most Complex)

Files: `OrderDetail.tsx`, `OrderDetailContext.tsx`, 9 card sub-components, 4 local hooks.

**Do last within this domain.**

| File | Change |
|---|---|
| `OrderDetailContext.tsx` | None — pure React context |
| `useOrderActions.ts` | None — pure logic |
| `useOrderAddresses.ts` | None |
| `useOrderPayments.ts` | None |
| `useOrderTax.ts` | None |
| `OrderSummaryCard.tsx` | Swap IonCard → `<Card>` |
| `OrderAddressesCard.tsx` | Swap IonCard/IonList → primitives |
| `OrderPaymentsCard.tsx` | Swap IonCard → `<Card>` |
| `OrderShippingCard.tsx` | Swap IonCard → `<Card>` |
| `OrderTaxCard.tsx` | Swap IonCard → `<Card>` |
| `OrderProductsCard.tsx` | Swap IonCard/IonList → `<Card>/<table>` |
| `OrderActionsCard.tsx` | Swap IonCard/IonButton → primitives |
| `OrderHistoryCard.tsx` | Swap IonCard/IonList → primitives |
| `OrderMetadataCard.tsx` | Swap IonCard → `<Card>` |
| `OrderCustomerCard.tsx` | Swap IonCard → `<Card>` |
| `OrderUtmCard.tsx` | Phase 6 accordion (Pattern 3 uncontrolled) |
| `VendorSegment.tsx` | Phase 6 accordion (Pattern 2) + Phase 7 tabs |

### 8g — Cart Wizard

Files: `CartForm.tsx`, 7 step components, `ManualQuoteModal.tsx`.

**`CartContext.tsx` (1088 lines)**: Keep entirely. Zero Ionic dependency. All 20+ useState hooks, cart step type, wizard navigation logic unchanged.

| Step | Key Ionic Usage |
|---|---|
| `CustomerStep.tsx` | IonInput, IonButton → primitives |
| `AddressStep.tsx` | IonList/IonItem, IonButton → primitives |
| `ProductsStep.tsx` | IonList/IonItem, IonButton → primitives |
| `ShippingStep.tsx` (1293 lines) | One IonAccordion (delivery settings: appointment, lift gate, limited access, instructions) → Phase 6 Pattern 2 |
| `PaymentStep.tsx` | IonInput → `<Input>` |
| `AppointmentStep.tsx` | IonDatetime → `<DatePicker>` |
| `SummaryStep.tsx` | IonCard/IonList → `<Card>/<ListItem>` |
| `ManualQuoteModal.tsx` | Phase 5 modal migration |

### 8h — SOPChecklist

File: `SOPChecklist.tsx` (709 lines).

- Phase 6 accordion (Pattern 2, boolean state)
- Header: progress badge (`7/10`) + status icon — keep logic, swap IonAccordion wrapper
- Steps: swap `IonItem` rows for `<ListItem>` or custom `<StepCard>` div
- Actions: swap `IonButton` for `<Button>` primitive
- `navigator.clipboard.writeText` + toast: replace `useIonToast` with `sonner`
- All step derivation logic (`isTaxCommitted`, `hasShipment`, etc.), `SOPAction` interface, `useEffect` completion detection — keep unchanged

### 8i — Admin Pages

Files: `ActivityLogList`, `ApiCallList`, `CustomerActivityLogList`, `NewCustomerRevenue`, `AIAssistant`.

Low Ionic surface — mostly tables and cards. Swap layout components with primitives.

---

## Phase 9 — Notifications & Feedback

**Goal**: Replace Ionic feedback mechanisms throughout the app.

| Ionic | Replacement | Files Affected |
|---|---|---|
| `useIonToast` | `sonner` toast | 20+ files using clipboard copy, mutation success/error |
| `useIonAlert` | Custom `useConfirmDialog` hook with Radix `<Dialog>` | Files using confirmation prompts |
| `IonLoading` overlay | `<Spinner>` overlay primitive | Loading states on async actions |
| `alert()` in Axios interceptor | `toast.error(message)` via `sonner` | `src/lib/Axios.tsx` — one change |

**`sonner` setup**: Add `<Toaster>` once at app root. All `useIonToast` calls replace with `toast.success()` / `toast.error()`.

---

## Phase 10 — Capacitor / Mobile Decision

### Option A — Keep Capacitor (Hybrid Mobile Target)

Capacitor plugins (`@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/app`, `@capacitor/status-bar`) have **no dependency on Ionic UI** — they survive migration intact.

- Remove: `@ionic/react`, `@ionic/react-router`
- Keep: `@capacitor/core`, all `@capacitor/*` plugins
- Keep: `usePwaInstall.ts`, `ReloadPrompt.tsx` (uses Vite PWA plugin — not Ionic)
- Keep: `useAppUpdate.ts`

### Option B — Web Only

- Remove: `capacitor.config.ts`, `ionic.config.json`, all `@capacitor/*` packages
- `useIsMobile.ts` remains — uses `window.innerWidth`, no Ionic dependency

---

## Phase 11 — Cleanup & Hardening

### Dead Code Removal

- Delete `src/pages/orders/OrderDetail.old.tsx`
- Delete `src/pages/orders/OrderList.old.tsx`
- Delete `src/components/OrderList.old.tsx`
- Delete `src/components/OrderListIonic.tsx` (superseded post-migration)
- Remove `statusExpanded` state + commented-out vendor status accordion block in `VendorSegment.tsx`

### Flags for Post-Migration Fixes

- Hard-coded role check in `Menu.tsx`: `employee.id === 1 || employee.id === 8` → needs proper RBAC
- Static HMAC signature in `Axios.tsx` (`"32a57dbed11b52d7347f3a766b6c9645"`) → security audit
- `alert()` calls in Axios error handler → replaced in Phase 9, but audit for any remaining `window.alert` calls

### Testing

- Add Vitest + Testing Library unit tests for all Phase 3 design primitives
- Add Vitest tests for updated hooks (useSegmentSlider signature change)
- Run existing Cypress e2e suite (`cypress/e2e/test.cy.ts`) against migrated app

---

## Phase Summary

| Phase | Scope | Complexity | Parallel? |
|---|---|---|---|
| 1 | Bootstrap + dependency swap | Low | No — prerequisite |
| 2 | Routing + shell layout | Medium | No — prerequisite |
| 3 | Design system primitives (14 components) | Medium | Yes — parallel team |
| 4 | Navigation / sidebar | Medium | After Ph 2 + 3 |
| 5 | Modal system (30+ modals) | High | After Ph 3 |
| 6 | Accordion components (3 patterns) | Low | After Ph 3 |
| 7 | Tab / segment components | Medium | After Ph 3 |
| 8a–c | Auth, list pages, simple forms | Low–Medium | After Ph 3–5 |
| 8d–h | Complex pages (OrderDetail, Cart, SOP) | High | After Ph 6–7 |
| 8i | Admin pages | Low | After Ph 3–5 |
| 9 | Notifications & feedback | Low | Anytime after Ph 3 |
| 10 | Capacitor decision | Low | Anytime |
| 11 | Cleanup + hardening | Low | Last |
