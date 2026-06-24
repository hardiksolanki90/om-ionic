import { useQuery } from '@tanstack/react-query'
import { fetchCountries } from '../../services/organisationOnboardingService'
import type { OnboardingFormState } from '../../types/organisationOnboarding'
import { OrganizationStep } from '../onboarding/OrganizationStep'
import { ContactStep } from '../onboarding/ContactStep'
import { AddressStep } from '../onboarding/AddressStep'
import { FinancialStep } from '../onboarding/FinancialStep'
import { TaxStep } from '../onboarding/TaxStep'
import { ErpSettingsStep } from '../onboarding/ErpSettingsStep'
import { onboardingInfoBoxClass } from '../onboarding/onboardingStyles'

interface Props {
  form: OnboardingFormState
  errors: Record<string, string>
  taxRequired?: boolean
  onChange: <K extends keyof OnboardingFormState>(section: K, value: OnboardingFormState[K]) => void
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 first:border-0 first:pt-0">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {children}
    </div>
  )
}

export function OrganisationProfileForm({ form, errors, taxRequired, onChange }: Props) {
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  })

  const taxLabel = form.tax_configuration.taxRegistrationLabel || 'Tax Registration Number'

  return (
    <div className="space-y-2">
      <div className={onboardingInfoBoxClass}>
        Country: <strong className="text-slate-800 dark:text-slate-100">{form.address.country || '—'}</strong>
        <span className="text-slate-400 dark:text-slate-500 ml-2">(cannot be changed)</span>
      </div>

      <SectionCard title="Organization">
        <OrganizationStep
          data={form.organization}
          errors={errors}
          onChange={v => onChange('organization', v)}
        />
      </SectionCard>

      <SectionCard title="Contact">
        <ContactStep
          data={form.contact}
          errors={errors}
          onChange={v => onChange('contact', v)}
        />
      </SectionCard>

      <SectionCard title="Address">
        <AddressStep
          data={form.address}
          errors={errors}
          onChange={v => onChange('address', v)}
        />
      </SectionCard>

      <SectionCard title="Financial">
        <FinancialStep
          data={form.financial}
          countries={countries}
          errors={errors}
          onChange={v => onChange('financial', v)}
        />
      </SectionCard>

      <SectionCard title="Tax">
        <TaxStep
          organization={form.organization}
          taxConfig={form.tax_configuration}
          taxLabel={taxLabel}
          taxRequired={taxRequired}
          errors={errors}
          onChangeOrg={v => onChange('organization', v)}
        />
      </SectionCard>

      <SectionCard title="ERP Settings">
        <ErpSettingsStep
          data={form.erp_settings}
          onChange={v => onChange('erp_settings', v)}
        />
      </SectionCard>
    </div>
  )
}

export function validateProfileForm(
  form: OnboardingFormState,
  taxRequired?: boolean,
  taxLabel = 'Tax Registration Number',
): Record<string, string> {
  const e: Record<string, string> = {}

  if (!form.organization.name.trim()) e['organization.name'] = 'Organization name is required'
  if (!form.contact.primaryContactName.trim()) e['contact.primaryContactName'] = 'Contact name is required'
  if (!form.contact.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.email)) {
    e['contact.email'] = 'Valid email is required'
  }
  if (!form.contact.mobile.trim()) e['contact.mobile'] = 'Mobile number is required'
  if (!form.address.addressLine1.trim()) e['address.addressLine1'] = 'Address is required'
  if (!form.address.city.trim()) e['address.city'] = 'City is required'
  if (!form.address.postalCode.trim()) e['address.postalCode'] = 'Postal code is required'
  if (!form.financial.baseCurrency.trim()) e['financial.baseCurrency'] = 'Base currency is required'
  if (taxRequired && !form.organization.taxRegistrationNumber.trim()) {
    e['organization.taxRegistrationNumber'] = `${taxLabel} is required`
  }

  return e
}
