export interface Country {
  id: number
  name: string
  countryCode: string
  dialCode?: string
  currency?: string
  currencyCode?: string
  currencySymbol?: string
  timezone?: string
  dateFormat?: string
  numberFormat?: string
  fiscalYearStart?: string
  fiscalYearEnd?: string
  accountingStandard?: string
}

export interface CurrencyOption {
  code: string
  symbol: string
  name: string
}

/** Unique currencies derived from the countries list (for financial step dropdown). */
export function buildCurrencyOptions(countries: Country[]): CurrencyOption[] {
  const map = new Map<string, CurrencyOption>()

  for (const country of countries) {
    const code = country.currencyCode?.trim()
    if (!code) continue

    const existing = map.get(code)
    const symbol = country.currencySymbol?.trim()
    const name = country.currency?.trim() || code

    if (!existing) {
      map.set(code, { code, symbol: symbol || code, name })
    } else if (existing.symbol === existing.code && symbol) {
      map.set(code, { ...existing, symbol })
    }
  }

  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code))
}

export function symbolForCurrency(code: string, options: CurrencyOption[]): string {
  return options.find((o) => o.code === code)?.symbol ?? code
}

export interface OrganizationSection {
  name: string
  legalBusinessName: string
  companyRegistrationNumber: string
  taxRegistrationNumber: string
  taxType: string[]
  industry: string
  businessType: string
  logo: string
  website: string
  status: 'active' | 'inactive'
}

export interface ContactSection {
  primaryContactName: string
  designation: string
  email: string
  mobile: string
  alternatePhone: string
}

export interface AddressSection {
  addressLine1: string
  addressLine2: string
  city: string
  stateProvince: string
  postalCode: string
  country: string
  countryCode: string
  countryId: number | null
}

export interface FinancialSection {
  baseCurrency: string
  currencySymbol: string
  fiscalYearStart: string
  fiscalYearEnd: string
  financialYearFormat: string
  numberFormat: string
  dateFormat: string
  timezone: string
  language: string
}

export interface TaxConfigurationSection {
  taxSystem: string
  taxRegistrationLabel: string
  taxPercentageRules: number[]
  vatConfiguration: Record<string, unknown>
  gstConfiguration: Record<string, unknown>
  salesTaxConfiguration: Record<string, unknown>
  exciseDutyConfiguration: Record<string, unknown>
  withholdingTaxConfiguration: Record<string, unknown>
  reverseChargeMechanism: boolean
  inputTaxCreditSupport: boolean
  multiTaxSupport: boolean
}

export interface ErpSettingsSection {
  defaultWarehouse: string
  defaultCostCenter: string | null
  defaultBranch: string | null
  defaultPaymentTerms: string | null
  defaultInvoicePrefix: string
  defaultPurchaseOrderPrefix: string
  defaultCustomerCodePrefix: string
  defaultVendorCodePrefix: string
  multiCurrencyEnabled: boolean
  multiBranchEnabled: boolean
  multiWarehouseEnabled: boolean
}

export interface ComplianceSection {
  country: string
  stateProvince: string
  taxJurisdiction: string
  localAccountingStandard: string
  invoiceNumberingFormat: string
  electronicInvoiceRequired: boolean
  taxFilingFrequency: string
}

export interface OnboardingProfile {
  organization: OrganizationSection
  contact: ContactSection
  address: AddressSection
  financial: FinancialSection
  tax_configuration: TaxConfigurationSection
  erp_settings: ErpSettingsSection
  compliance: ComplianceSection
}

export interface OnboardingFormState {
  countryId: number | null
  organization: OrganizationSection
  contact: ContactSection
  address: AddressSection
  financial: FinancialSection
  tax_configuration: TaxConfigurationSection
  erp_settings: ErpSettingsSection
  compliance: ComplianceSection
}

export interface TaxProfilePreview {
  country: { id: number; name: string; countryCode: string }
  financial: FinancialSection
  taxConfiguration: TaxConfigurationSection
  taxProfile: {
    taxRegistrationLabel: string
    taxRegistrationRequired?: boolean
    supportedTaxTypes?: string[]
    taxSystem?: string
  }
  erpDefaults: ErpSettingsSection
  compliance: Partial<ComplianceSection>
}

export function profileToFormState(profile: OnboardingProfile): OnboardingFormState {
  return {
    countryId: profile.address.countryId,
    organization: { ...profile.organization },
    contact: { ...profile.contact },
    address: { ...profile.address },
    financial: { ...profile.financial },
    tax_configuration: { ...profile.tax_configuration },
    erp_settings: { ...profile.erp_settings },
    compliance: { ...profile.compliance },
  }
}

export const BUSINESS_TYPES = [
  'Private Limited',
  'LLC',
  'Sole Proprietorship',
  'Partnership',
  'Non-Profit',
  'Government',
] as const

export const FINANCIAL_YEAR_FORMATS = [
  { value: 'Jan-Dec', label: 'January – December' },
  { value: 'Apr-Mar', label: 'April – March' },
  { value: 'Jul-Jun', label: 'July – June' },
] as const

export const NUMBER_FORMATS = [
  { value: '1,234.56', label: '1,234.56 — Comma thousands, dot decimal (US/UK)' },
  { value: '12,34,567.89', label: '12,34,567.89 — Indian lakh grouping' },
  { value: '1.234,56', label: '1.234,56 — Dot thousands, comma decimal (EU)' },
  { value: '1 234,56', label: '1 234,56 — Space thousands, comma decimal' },
  { value: '1234.56', label: '1234.56 — No thousands separator' },
] as const

export const EMPTY_ONBOARDING_FORM: OnboardingFormState = {
  countryId: null,
  organization: {
    name: '',
    legalBusinessName: '',
    companyRegistrationNumber: '',
    taxRegistrationNumber: '',
    taxType: [],
    industry: '',
    businessType: 'Private Limited',
    logo: '',
    website: '',
    status: 'active',
  },
  contact: {
    primaryContactName: '',
    designation: '',
    email: '',
    mobile: '',
    alternatePhone: '',
  },
  address: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    countryCode: '',
    countryId: null,
  },
  financial: {
    baseCurrency: 'USD',
    currencySymbol: '$',
    fiscalYearStart: '01-01',
    fiscalYearEnd: '12-31',
    financialYearFormat: 'Jan-Dec',
    numberFormat: '1,234.56',
    dateFormat: 'YYYY-MM-DD',
    timezone: 'UTC',
    language: 'en',
  },
  tax_configuration: {
    taxSystem: 'generic',
    taxRegistrationLabel: 'Tax Registration Number',
    taxPercentageRules: [],
    vatConfiguration: {},
    gstConfiguration: {},
    salesTaxConfiguration: {},
    exciseDutyConfiguration: {},
    withholdingTaxConfiguration: {},
    reverseChargeMechanism: false,
    inputTaxCreditSupport: false,
    multiTaxSupport: false,
  },
  erp_settings: {
    defaultWarehouse: 'Main Warehouse',
    defaultCostCenter: null,
    defaultBranch: null,
    defaultPaymentTerms: null,
    defaultInvoicePrefix: 'INV',
    defaultPurchaseOrderPrefix: 'PO',
    defaultCustomerCodePrefix: 'CUST',
    defaultVendorCodePrefix: 'VEND',
    multiCurrencyEnabled: false,
    multiBranchEnabled: false,
    multiWarehouseEnabled: false,
  },
  compliance: {
    country: '',
    stateProvince: '',
    taxJurisdiction: '',
    localAccountingStandard: 'IFRS',
    invoiceNumberingFormat: '{PREFIX}-{SEQ}',
    electronicInvoiceRequired: false,
    taxFilingFrequency: 'annual',
  },
}
