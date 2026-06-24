import { useCallback, useState } from 'react'
import { Building2, Pencil, User as UserIcon, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useMyOrganisation, useUpdateMyOrganisation } from '../../hooks/useMyOrganisation'
import { PageLayout } from '../../layouts/PageLayout'
import { Button } from '../../components/ui/Button'
import { OrganisationProfileForm, validateProfileForm } from '../../components/profile/OrganisationProfileForm'
import { profileToFormState, type OnboardingFormState } from '../../types/organisationOnboarding'
import { fetchTaxProfile } from '../../services/organisationOnboardingService'

function Field({ label, value }: { label: string; value: unknown }) {
  const display = value === null || value === undefined || value === '' ? '—' : String(value)
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{label}</p>
      <p className="text-slate-900 dark:text-slate-100">{display}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  )
}

function yesNo(value: boolean) {
  return value ? 'Yes' : 'No'
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { data, isLoading, isError } = useMyOrganisation(!!user?.hasOrganisation)
  const updateMutation = useUpdateMyOrganisation()
  const profile = data?.profile

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<OnboardingFormState | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [taxRequired, setTaxRequired] = useState(false)

  const updateForm = useCallback(<K extends keyof OnboardingFormState>(
    section: K,
    value: OnboardingFormState[K],
  ) => {
    setForm(prev => (prev ? { ...prev, [section]: value } : prev))
  }, [])

  const startEditing = async () => {
    if (!profile) return
    const nextForm = profileToFormState(profile)
    setForm(nextForm)
    setErrors({})
    setSaveError(null)
    setIsEditing(true)

    if (nextForm.address.countryCode) {
      try {
        const preview = await fetchTaxProfile(nextForm.address.countryCode)
        setTaxRequired(!!preview.taxProfile.taxRegistrationRequired)
      } catch {
        setTaxRequired(false)
      }
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setForm(null)
    setErrors({})
    setSaveError(null)
  }

  const handleSave = async () => {
    if (!form || !profile) return

    const taxLabel = form.tax_configuration.taxRegistrationLabel || 'Tax Registration Number'
    const validationErrors = validateProfileForm(form, taxRequired, taxLabel)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setSaveError(null)

    try {
      await updateMutation.mutateAsync(form)
      setIsEditing(false)
      setForm(null)
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      if (response?.errors) {
        const mapped: Record<string, string> = {}
        for (const [key, messages] of Object.entries(response.errors)) {
          mapped[key] = messages[0] ?? 'Invalid value'
        }
        setErrors(mapped)
      } else {
        setSaveError(response?.message ?? 'Failed to save organisation profile.')
      }
    }
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </PageLayout>
    )
  }

  const org = profile?.organization
  const contact = profile?.contact
  const address = profile?.address
  const financial = profile?.financial
  const tax = profile?.tax_configuration
  const erp = profile?.erp_settings
  const compliance = profile?.compliance

  const addressLine = [
    address?.addressLine1,
    address?.addressLine2,
    address?.city,
    address?.stateProvince,
    address?.postalCode,
    address?.country,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <PageLayout>
      <div className="flex flex-col mx-auto space-y-6 max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Your Profile</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Account and organisation details</p>
          </div>
          {user?.hasOrganisation && profile && !isEditing && (
            <Button variant="outline" icon={<Pencil className="w-4 h-4" />} onClick={startEditing}>
              Edit Organisation
            </Button>
          )}
          {isEditing && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" icon={<X className="w-4 h-4" />} onClick={cancelEditing}>
                Cancel
              </Button>
              <Button loading={updateMutation.isPending} onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.name ?? '—'}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email ?? '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Email" value={user?.email} />
            <Field label="Mobile" value={user?.mobile} />
            <Field label="Role" value={user?.role} />
          </div>
        </div>

        {!user?.hasOrganisation ? (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-6">
            <p className="text-amber-800 dark:text-amber-200">Organisation onboarding is not complete yet.</p>
          </div>
        ) : isError || !profile ? (
          <div className="rounded-2xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/30 p-6">
            <p className="text-red-800 dark:text-red-200">Unable to load organisation details.</p>
          </div>
        ) : isEditing && form ? (
          <div className="space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
            {saveError && (
              <div className="rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                {saveError}
              </div>
            )}
            <OrganisationProfileForm
              form={form}
              errors={errors}
              taxRequired={taxRequired}
              onChange={updateForm}
            />
          </div>
        ) : (
          <div className="space-y-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{org?.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{address?.country}</p>
              </div>
            </div>

            <Section title="Organization">
              <Field label="Display Name" value={org?.name} />
              <Field label="Legal Business Name" value={org?.legalBusinessName} />
              <Field label="Industry" value={org?.industry} />
              <Field label="Business Type" value={org?.businessType} />
              <Field label="Company Registration No." value={org?.companyRegistrationNumber} />
              <Field label={tax?.taxRegistrationLabel ?? 'Tax Registration No.'} value={org?.taxRegistrationNumber} />
              <Field label="Website" value={org?.website} />
            </Section>

            <Section title="Contact">
              <Field label="Primary Contact" value={contact?.primaryContactName} />
              <Field label="Designation" value={contact?.designation} />
              <Field label="Email" value={contact?.email} />
              <Field label="Mobile" value={contact?.mobile} />
              <Field label="Alternate Phone" value={contact?.alternatePhone} />
            </Section>

            <Section title="Address">
              <Field label="Full Address" value={addressLine || '—'} />
              <Field label="City" value={address?.city} />
              <Field label="State / Province" value={address?.stateProvince} />
              <Field label="Postal Code" value={address?.postalCode} />
              <Field label="Country" value={address?.country} />
            </Section>

            <Section title="Financial">
              <Field label="Base Currency" value={financial?.baseCurrency} />
              <Field label="Currency Symbol" value={financial?.currencySymbol} />
              <Field label="Fiscal Year" value={`${financial?.fiscalYearStart} – ${financial?.fiscalYearEnd}`} />
              <Field label="Date Format" value={financial?.dateFormat} />
              <Field label="Number Format" value={financial?.numberFormat} />
              <Field label="Timezone" value={financial?.timezone} />
              <Field label="Language" value={financial?.language} />
            </Section>

            <Section title="Tax Configuration">
              <Field label="Tax System" value={tax?.taxSystem} />
              <Field label="Tax Types" value={org?.taxType?.length ? org.taxType.join(', ') : '—'} />
              <Field label="Input Tax Credit" value={yesNo(tax?.inputTaxCreditSupport ?? false)} />
              <Field label="Reverse Charge" value={yesNo(tax?.reverseChargeMechanism ?? false)} />
              <Field label="Multi Tax Support" value={yesNo(tax?.multiTaxSupport ?? false)} />
            </Section>

            <Section title="ERP Settings">
              <Field label="Default Warehouse" value={erp?.defaultWarehouse} />
              <Field label="Multi Currency" value={yesNo(erp?.multiCurrencyEnabled ?? false)} />
              <Field label="Multi Branch" value={yesNo(erp?.multiBranchEnabled ?? false)} />
              <Field label="Multi Warehouse" value={yesNo(erp?.multiWarehouseEnabled ?? false)} />
            </Section>

            <Section title="Compliance">
              <Field label="Accounting Standard" value={compliance?.localAccountingStandard} />
              <Field label="Tax Filing Frequency" value={compliance?.taxFilingFrequency} />
              <Field label="Tax Jurisdiction" value={compliance?.taxJurisdiction} />
              <Field label="E-Invoice Required" value={yesNo(compliance?.electronicInvoiceRequired ?? false)} />
              <Field label="Invoice Numbering" value={compliance?.invoiceNumberingFormat} />
            </Section>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
