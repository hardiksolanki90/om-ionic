import { useCallback, useState } from 'react'
import { fetchTaxProfile } from '../services/organisationOnboardingService'
import {
  EMPTY_ONBOARDING_FORM,
  type OnboardingFormState,
  type TaxProfilePreview,
} from '../types/organisationOnboarding'

type OnboardingInitial = {
  countryId?: number | null
  organization?: Partial<OnboardingFormState['organization']>
  contact?: Partial<OnboardingFormState['contact']>
  address?: Partial<OnboardingFormState['address']>
  financial?: Partial<OnboardingFormState['financial']>
  tax_configuration?: Partial<OnboardingFormState['tax_configuration']>
  erp_settings?: Partial<OnboardingFormState['erp_settings']>
  compliance?: Partial<OnboardingFormState['compliance']>
}

export const ONBOARDING_STEPS = [
  'Country',
  'Organization',
  'Contact',
  'Address',
  'Financial',
  'Tax',
  'ERP Settings',
  'Review',
] as const

export type OnboardingStep = typeof ONBOARDING_STEPS[number]

export function useOrganisationOnboarding(initial?: OnboardingInitial) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<OnboardingFormState>({
    ...EMPTY_ONBOARDING_FORM,
    countryId: initial?.countryId ?? null,
    organization: { ...EMPTY_ONBOARDING_FORM.organization, ...initial?.organization },
    contact: { ...EMPTY_ONBOARDING_FORM.contact, ...initial?.contact },
    address: { ...EMPTY_ONBOARDING_FORM.address, ...initial?.address },
    financial: { ...EMPTY_ONBOARDING_FORM.financial, ...initial?.financial },
    tax_configuration: { ...EMPTY_ONBOARDING_FORM.tax_configuration, ...initial?.tax_configuration },
    erp_settings: { ...EMPTY_ONBOARDING_FORM.erp_settings, ...initial?.erp_settings },
    compliance: { ...EMPTY_ONBOARDING_FORM.compliance, ...initial?.compliance },
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [taxPreview, setTaxPreview] = useState<TaxProfilePreview | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  const updateForm = useCallback(<K extends keyof OnboardingFormState>(
    section: K,
    value: OnboardingFormState[K],
  ) => {
    setForm(prev => ({ ...prev, [section]: value }))
  }, [])

  const loadCountryProfile = useCallback(async (countryCode: string, countryName: string, countryId: number) => {
    setLoadingPreview(true)
    try {
      const preview = await fetchTaxProfile(countryCode)
      setTaxPreview(preview)
      setForm(prev => ({
        ...prev,
        countryId,
        address: {
          ...prev.address,
          country: countryName,
          countryCode,
          countryId,
        },
        financial: preview.financial,
        tax_configuration: preview.taxConfiguration,
        organization: {
          ...prev.organization,
          taxType: preview.taxProfile.supportedTaxTypes ?? [],
        },
        erp_settings: preview.erpDefaults,
        compliance: {
          ...prev.compliance,
          country: countryName,
          localAccountingStandard: preview.compliance.localAccountingStandard ?? 'IFRS',
          electronicInvoiceRequired: preview.compliance.electronicInvoiceRequired ?? false,
          taxFilingFrequency: preview.compliance.taxFilingFrequency ?? 'annual',
          invoiceNumberingFormat: preview.compliance.invoiceNumberingFormat ?? '{PREFIX}-{SEQ}',
        },
      }))
    } finally {
      setLoadingPreview(false)
    }
  }, [])

  const validateStep = useCallback((stepIndex: number): boolean => {
    const e: Record<string, string> = {}
    const f = form

    switch (stepIndex) {
      case 0:
        if (!f.countryId) e.countryId = 'Please select a country'
        break
      case 1:
        if (!f.organization.name.trim()) e['organization.name'] = 'Organization name is required'
        break
      case 2:
        if (!f.contact.primaryContactName.trim()) e['contact.primaryContactName'] = 'Contact name is required'
        if (!f.contact.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contact.email)) e['contact.email'] = 'Valid email is required'
        if (!f.contact.mobile.trim()) e['contact.mobile'] = 'Mobile number is required'
        break
      case 3:
        if (!f.address.addressLine1.trim()) e['address.addressLine1'] = 'Address is required'
        if (!f.address.city.trim()) e['address.city'] = 'City is required'
        if (!f.address.postalCode.trim()) e['address.postalCode'] = 'Postal code is required'
        break
      case 4:
        if (!f.financial.baseCurrency.trim()) e['financial.baseCurrency'] = 'Base currency is required'
        break
      case 5: {
        const required = taxPreview?.taxProfile.taxRegistrationRequired
        if (required && !f.organization.taxRegistrationNumber.trim()) {
          e['organization.taxRegistrationNumber'] = `${taxPreview?.taxProfile.taxRegistrationLabel ?? 'Tax ID'} is required`
        }
        break
      }
      default:
        break
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }, [form, taxPreview])

  const next = () => {
    if (!validateStep(step)) return
    setStep(s => Math.min(s + 1, ONBOARDING_STEPS.length - 1))
  }

  const back = () => setStep(s => Math.max(s - 1, 0))

  return {
    step,
    setStep,
    form,
    setForm,
    updateForm,
    errors,
    setErrors,
    taxPreview,
    loadingPreview,
    loadCountryProfile,
    validateStep,
    next,
    back,
  }
}
