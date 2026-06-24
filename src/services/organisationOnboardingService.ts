import api from '../lib/Axios'
import type { Country, OnboardingFormState, OnboardingProfile, TaxProfilePreview } from '../types/organisationOnboarding'

export async function fetchCountries(): Promise<Country[]> {
  const res: { items: Country[] } = await api.get('/admin/countries')
  return res.items
}

export async function fetchTaxProfile(countryCode: string): Promise<TaxProfilePreview> {
  return api.get(`/admin/countries/${countryCode}/tax-profile`)
}

export async function submitOnboarding(payload: OnboardingFormState): Promise<{ profile: OnboardingProfile; message: string }> {
  return api.post('/admin/organisations/onboard', {
    countryId: payload.countryId,
    organization: payload.organization,
    contact: payload.contact,
    address: {
      ...payload.address,
      countryId: payload.countryId,
    },
    financial: payload.financial,
    erpSettings: payload.erp_settings,
    compliance: payload.compliance,
  })
}

export async function fetchMyOrganisation(): Promise<{ profile: OnboardingProfile }> {
  return api.get('/admin/organisations/me')
}

export async function updateMyOrganisation(payload: OnboardingFormState): Promise<{ profile: OnboardingProfile; message: string }> {
  return api.put('/admin/organisations/me', {
    countryId: payload.countryId,
    organization: payload.organization,
    contact: payload.contact,
    address: {
      ...payload.address,
      countryId: payload.countryId,
    },
    financial: payload.financial,
    erpSettings: payload.erp_settings,
    compliance: payload.compliance,
  })
}

import type { User } from '../types/auth'

export async function registerUser(data: {
  firstName: string
  lastName: string
  orgName: string
  email: string
  mobile: string
  password: string
  password_confirmation: string
}): Promise<{ user: User; message: string }> {
  return api.post('/admin/register', data)
}
