---
name: ERP Org Onboarding
overview: Build a post-registration multi-step onboarding wizard in om-ionic that collects a full organization profile, auto-configures country-specific tax/financial defaults via a backend service in om-laravel, persists ERP-ready settings, and gates dashboard access until onboarding completes.
todos:
  - id: db-schema
    content: Add countries table, extend organisations, create organisation_tax_configurations migration + seeders
    status: pending
  - id: tax-profile-service
    content: Build config/country_tax_profiles.php and OrganisationTaxProfileService with resolve/validate/suggest methods
    status: pending
  - id: onboarding-service
    content: "Build OrganisationOnboardingService (transaction: org + tax config + warehouse + code defaults + user link)"
    status: pending
  - id: api-endpoints
    content: Add register, countries, tax-profile preview, onboard, and organisations/me API endpoints with FormRequests
    status: pending
  - id: wizard-ui
    content: Build 8-step OrganisationOnboardingWizard with country-driven tax/financial pre-fill and review JSON step
    status: pending
  - id: auth-gating
    content: Wire Register to API, extend AuthContext user shape, gate ProtectedRoute to /onboarding when !hasOrganisation
    status: pending
isProject: false
---

# Global ERP Organization Onboarding Wizard

## Current State

The stack has partial building blocks but no end-to-end onboarding:

| Layer | Exists today | Gap |
|-------|-------------|-----|
| [Register.tsx](om-ionic/src/pages/auth/Register.tsx) | 2-step UI (identity + credentials) | No API call; fake success delay |
| [AuthController.php](om-laravel/app/Http/Controllers/AuthController.php) | Login/logout/me | No `register` endpoint; `me` already returns `hasOrganisation` |
| [Organisation model](om-laravel/app/Models/Organisation.php) | Basic address/contact/currency | Missing legal name, industry, website, financial/tax/ERP/compliance fields |
| [StoreOrganisationRequest.php](om-laravel/app/Http/Requests/StoreOrganisationRequest.php) | ~15 fields | No tax auto-config, no structured JSON profile |
| Countries | Not in om-laravel | Reference exists in [order-management](order-management/database/migrations/2025_12_26_155832_create_countries_table.php) |
| ERP defaults | [CodeGenerationService::seedDefaults](om-laravel/app/Services/CodeGenerationService.php) | Only code prefixes; no default warehouse, no tax profile |

## Target User Flow

```mermaid
flowchart TD
  register[Register Step 1-2] --> createUser[POST /admin/register]
  createUser --> loginSession[Auto-login session]
  loginSession --> onboardRoute[/onboarding wizard]
  onboardRoute --> stepCountry[Step 1: Country selection]
  stepCountry --> autoSuggest[GET tax-profile preview]
  autoSuggest --> stepOrg[Step 2: Organization details]
  stepOrg --> stepContact[Step 3: Contact]
  stepContact --> stepAddress[Step 4: Address]
  stepAddress --> stepFinancial[Step 5: Financial - pre-filled]
  stepFinancial --> stepTax[Step 6: Tax - country-driven fields]
  stepTax --> stepErp[Step 7: ERP settings - pre-filled]
  stepErp --> review[Step 8: Review JSON preview]
  review --> submit[POST /organisations/onboard]
  submit --> dashboard[Redirect to Dashboard]
  loginExisting[Existing login] --> checkOrg{hasOrganisation?}
  checkOrg -->|no| onboardRoute
  checkOrg -->|yes| dashboard
```

## Architecture

### 1. Data Model (om-laravel)

**A. Port `countries` table** (global reference, not org-scoped)

- Columns: `id`, `name`, `country_code` (ISO 3166-1 alpha-2), `dial_code`, `currency`, `currency_code`, `currency_symbol`, `timezone`, `date_format`, `number_format`, `fiscal_year_start`, `fiscal_year_end`, `accounting_standard`
- Seeder: ~195 countries (reuse/port from order-management + enrich top markets)

**B. Extend `organisations` table** (new migration)

Add columns for commonly queried fields; use JSON `metadata` for extended ERP config (matches existing project pattern):

| Column | Maps to spec |
|--------|-------------|
| `org_legal_name` | Legal Business Name |
| `org_industry` | Industry |
| `org_business_type` | Business Type enum |
| `org_website` | Website |
| `org_email` | Primary contact email |
| `org_contact_designation` | Designation |
| `org_alt_phone` | Alternate phone |
| `onboarding_completed_at` | Gate flag (nullable until wizard done) |
| `metadata` (JSON) | `financial`, `erp_settings`, `compliance`, `tax_overrides` |

Keep existing columns: `org_name`, `org_company_id`, `org_tax_id`, address fields, `org_currency`, `org_fasical_year`, `org_status`, `org_logo`.

**C. New `organisation_tax_configurations` table**

One row per organisation, stores resolved country tax profile at onboarding time:

```php
organisation_id, country_code, tax_system, tax_registration_label,
config (JSON: rates, gst/vat/sales_tax blocks, withholding, reverse_charge, input_tax_credit, multi_tax)
```

This avoids re-parsing static config on every request and gives ERP modules a stable tax snapshot.

### 2. Country Tax Profile Registry (static, global)

New file: [`om-laravel/config/country_tax_profiles.php`](om-laravel/config/country_tax_profiles.php)

Keyed by ISO country code. **Detailed profiles** for the examples in the spec (IN, US, GB, AE, CA, AU) plus ~15 other common markets. **Generic fallback** for all other countries:

```php
'default' => [
  'taxSystem' => 'generic',
  'taxRegistrationLabel' => 'Tax Registration Number',
  'supportedTaxTypes' => ['sales_tax'],
  'multiTaxSupport' => false,
  'inputTaxCreditSupport' => false,
  // ...
]
```

Example India entry structure:

```php
'IN' => [
  'taxSystem' => 'gst',
  'taxRegistrationLabel' => 'GSTIN',
  'taxRegistrationPattern' => '/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/',
  'gst' => ['cgst' => true, 'sgst' => true, 'igst' => true],
  'withholding' => ['tds' => true, 'tcs' => true],
  'reverseChargeMechanism' => true,
  'inputTaxCreditSupport' => true,
  'multiTaxSupport' => true,
  'taxRates' => [0, 5, 12, 18, 28],
  'taxFilingFrequency' => 'monthly',
  'electronicInvoiceRequired' => true,
]
```

New service: [`OrganisationTaxProfileService.php`](om-laravel/app/Services/OrganisationTaxProfileService.php)

- `resolve(string $countryCode): array` — merge country-specific + global defaults
- `suggestFinancialSettings(Country $country): array` — currency, symbol, fiscal year, timezone, date/number format
- `validateTaxRegistration(string $countryCode, string $value): bool`

### 3. Onboarding Orchestrator (om-laravel)

New service: [`OrganisationOnboardingService.php`](om-laravel/app/Services/OrganisationOnboardingService.php)

Single transaction that:

1. Validates mandatory fields (org name, country, primary contact name/email/mobile, address line 1, city, postal, base currency)
2. Builds the structured JSON profile (exact shape from spec)
3. Creates/updates `Organisation` record
4. Creates `OrganisationTaxConfiguration` from resolved profile + user-entered tax ID
5. Seeds ERP defaults:
   - Existing `CodeGenerationService::seedDefaults()` with country-aware prefixes (e.g. `INV-`, `PO-`, `CUST-`, `VEND-`)
   - Create default warehouse named `"Main Warehouse"` at org address
6. Links `user.organisation_id` and sets `onboarding_completed_at`
7. Returns full JSON profile in response

### 4. API Endpoints (om-laravel)

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/admin/register` | Create user (first/last name, email, mobile, password); auto-login |
| `GET` | `/api/countries` | List countries with currency/timezone hints |
| `GET` | `/api/countries/{code}/tax-profile` | Preview auto-config before submit (drives wizard steps 5-6) |
| `POST` | `/api/organisations/onboard` | Submit full profile; auth required; user must not already have completed org |
| `GET` | `/api/organisations/me` | Current user's org profile (for review/edit later) |

**New FormRequests:**

- `RegisterRequest` — user credentials validation
- `OrganisationOnboardingRequest` — nested validation matching JSON sections; country-aware rules (e.g. GSTIN pattern when country=IN)

**Controller additions:**

- `AuthController::register()`
- `CountryController` (index, taxProfile)
- `OrganisationController::onboard()` + `me()`

### 5. Frontend Wizard (om-ionic)

**New files:**

| File | Role |
|------|------|
| [`src/types/organisationOnboarding.ts`](om-ionic/src/types/organisationOnboarding.ts) | Typed sections matching JSON output |
| [`src/services/organisationOnboardingService.ts`](om-ionic/src/services/organisationOnboardingService.ts) | API calls |
| [`src/hooks/useOrganisationOnboarding.ts`](om-ionic/src/hooks/useOrganisationOnboarding.ts) | Wizard state, step validation, country-change side effects |
| [`src/pages/onboarding/OrganisationOnboardingWizard.tsx`](om-ionic/src/pages/onboarding/OrganisationOnboardingWizard.tsx) | 8-step wizard UI |
| [`src/components/onboarding/*Step.tsx`](om-ionic/src/components/onboarding/) | One component per step |

**Wizard steps:**

1. **Country** — searchable select; triggers tax/financial preview fetch
2. **Organization** — name, legal name, registration #, industry, business type, logo upload, website, status
3. **Contact** — primary person, designation, email, mobile, alt phone
4. **Address** — lines, city, state, postal (country locked from step 1)
5. **Financial** — pre-filled from country; user can override currency, fiscal dates, formats, timezone, language
6. **Tax** — dynamic fields from `tax-profile` (label changes: GSTIN / VAT Number / EIN / TRN / ABN); tax type checkboxes
7. **ERP Settings** — default warehouse name, code prefixes (pre-filled), multi-currency/branch/warehouse toggles; cost center/branch/payment terms stored in metadata as optional strings until those modules exist
8. **Review** — read-only summary + collapsible JSON preview; submit

**Update existing files:**

- [`Register.tsx`](om-ionic/src/pages/auth/Register.tsx) — wire to `POST /admin/register`, redirect to `/onboarding` on success
- [`AuthContext.tsx`](om-ionic/src/contexts/AuthContext.tsx) + [`types/auth.ts`](om-ionic/src/types/auth.ts) — extend `User` with `hasOrganisation`, `organisationId`
- [`ProtectedRoute.tsx`](om-ionic/src/components/ProtectedRoute.tsx) — if authenticated but `!hasOrganisation`, redirect to `/onboarding` (except auth/onboarding routes)
- [`App.tsx`](om-ionic/src/App.tsx) — add `/onboarding` route inside auth shell (no sidebar until complete)

**UX rules:**

- Step-level validation before advancing; final validation on submit
- Country change on step 1 resets financial/tax pre-fills (with confirm dialog if data entered)
- Show auto-detected tax system badge (e.g. "GST System — India")
- Reuse existing auth page styling from [`auth.css`](om-ionic/src/pages/auth/auth.css)

### 6. JSON Output Contract

The onboarding API returns (and the review step displays):

```json
{
  "organization": {
    "name": "", "legalBusinessName": "", "companyRegistrationNumber": "",
    "taxRegistrationNumber": "", "taxType": [], "industry": "",
    "businessType": "", "logo": "", "website": "", "status": "active"
  },
  "contact": {
    "primaryContactName": "", "designation": "", "email": "",
    "mobile": "", "alternatePhone": ""
  },
  "address": {
    "addressLine1": "", "addressLine2": "", "city": "",
    "stateProvince": "", "postalCode": "", "country": "", "countryCode": ""
  },
  "financial": {
    "baseCurrency": "", "currencySymbol": "", "fiscalYearStart": "",
    "fiscalYearEnd": "", "financialYearFormat": "", "numberFormat": "",
    "dateFormat": "", "timezone": "", "language": ""
  },
  "tax_configuration": {
    "taxSystem": "", "taxRegistrationLabel": "", "taxPercentageRules": [],
    "vatConfiguration": {}, "gstConfiguration": {}, "salesTaxConfiguration": {},
    "exciseDutyConfiguration": {}, "withholdingTaxConfiguration": {},
    "reverseChargeMechanism": false, "inputTaxCreditSupport": false, "multiTaxSupport": false
  },
  "erp_settings": {
    "defaultWarehouse": "", "defaultCostCenter": null, "defaultBranch": null,
    "defaultPaymentTerms": null, "defaultInvoicePrefix": "INV",
    "defaultPurchaseOrderPrefix": "PO", "defaultCustomerCodePrefix": "CUST",
    "defaultVendorCodePrefix": "VEND", "multiCurrencyEnabled": false,
    "multiBranchEnabled": false, "multiWarehouseEnabled": false
  },
  "compliance": {
    "country": "", "stateProvince": "", "taxJurisdiction": "",
    "localAccountingStandard": "", "invoiceNumberingFormat": "",
    "electronicInvoiceRequired": false, "taxFilingFrequency": ""
  }
}
```

Field names use camelCase in API (consistent with existing [OrganisationResource](om-laravel/app/Http/Resources/OrganisationResource.php)).

### 7. Validation Matrix

**Always required:** org name, country, primary contact name, email, mobile, address line 1, city, postal code, base currency

**Country-conditional:**

| Country | Extra required | Format validation |
|---------|---------------|-------------------|
| IN | Tax reg # (GSTIN) | GSTIN regex |
| GB, AE | VAT/TRN number | Country-specific pattern |
| US | EIN (optional but validated if provided) | `XX-XXXXXXX` |
| CA, AU | GST/HST or ABN if tax enabled | Pattern per profile |

Generic countries: tax registration optional; generic label shown.

### 8. Out of Scope (Phase 1)

- Conversational AI chat UI (user chose wizard)
- Standalone Settings edit page (can be Phase 2 using same types/service)
- Branch, cost center, payment terms as first-class entities (stored in metadata until modules exist)
- Real-time tax rate API integration with government sources (static seeded profiles only)

### 9. Testing Checklist

- Register → onboarding redirect for new user
- Login without org → forced to onboarding
- Login with completed org → dashboard
- Country=IN auto-fills INR, Apr-Mar fiscal year, GSTIN label, CGST/SGST/IGST config
- Country=US auto-fills USD, Jan-Dec fiscal, EIN label, state/federal sales tax flags
- Invalid GSTIN blocked on step 6
- Submit creates org, tax config, default warehouse, code settings, links user
- `GET /organisations/me` returns full profile JSON

## Key Files to Create/Modify

**Backend (om-laravel):** 8 new files + 4 modified

- New: migrations (countries, extend organisations, organisation_tax_configurations), `Country` model, `OrganisationTaxConfiguration` model, `CountryTaxProfileService`, `OrganisationOnboardingService`, `CountryController`, `RegisterRequest`, `OrganisationOnboardingRequest`, seeders
- Modify: `AuthController`, `OrganisationController`, `Organisation` model, `OrganisationResource`, `routes/api.php`

**Frontend (om-ionic):** ~12 new files + 5 modified

- New: types, service, hook, wizard page, 8 step components
- Modify: `Register.tsx`, `AuthContext.tsx`, `types/auth.ts`, `ProtectedRoute.tsx`, `App.tsx`
