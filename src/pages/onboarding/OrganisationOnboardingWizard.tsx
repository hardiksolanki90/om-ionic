import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Building2, Check } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PENDING_ORG_NAME_KEY } from '../../types/auth'
import { useAuth } from '../../contexts/AuthContext'
import '../auth/auth.css'
import { ONBOARDING_STEPS, useOrganisationOnboarding } from '../../hooks/useOrganisationOnboarding'
import { fetchCountries, submitOnboarding } from '../../services/organisationOnboardingService'
import { CountryStep } from '../../components/onboarding/CountryStep'
import { OrganizationStep } from '../../components/onboarding/OrganizationStep'
import { ContactStep } from '../../components/onboarding/ContactStep'
import { AddressStep } from '../../components/onboarding/AddressStep'
import { FinancialStep } from '../../components/onboarding/FinancialStep'
import { TaxStep } from '../../components/onboarding/TaxStep'
import { ErpSettingsStep } from '../../components/onboarding/ErpSettingsStep'
import { ReviewStep } from '../../components/onboarding/ReviewStep'

export default function OrganisationOnboardingWizard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, refreshUser } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    step,
    form,
    updateForm,
    errors,
    taxPreview,
    loadingPreview,
    loadCountryProfile,
    validateStep,
    next,
    back,
  } = useOrganisationOnboarding({
    organization: { name: user?.pendingOrgName ?? '' },
    contact: {
      primaryContactName: user?.name ?? '',
      email: user?.email ?? '',
      mobile: user?.mobile ?? '',
      designation: '',
      alternatePhone: '',
    },
  })

  const { data: countries = [], isLoading: countriesLoading, isError: countriesError } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  })

  useEffect(() => {
    if (user?.hasOrganisation) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async () => {
    if (!validateStep(step)) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitOnboarding(form)
      sessionStorage.removeItem(PENDING_ORG_NAME_KEY)
      await refreshUser()
      queryClient.invalidateQueries({ queryKey: ['organisation'] })
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to complete onboarding. Please check your details.'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <CountryStep
            countries={countries}
            countryId={form.countryId}
            loading={loadingPreview}
            countriesLoading={countriesLoading}
            countriesError={countriesError}
            taxSystem={taxPreview?.taxConfiguration.taxSystem}
            error={errors.countryId}
            onSelect={c => loadCountryProfile(c.countryCode, c.name, c.id)}
          />
        )
      case 1:
        return (
          <OrganizationStep
            data={form.organization}
            errors={errors}
            onChange={v => updateForm('organization', v)}
          />
        )
      case 2:
        return (
          <ContactStep
            data={form.contact}
            errors={errors}
            onChange={v => updateForm('contact', v)}
          />
        )
      case 3:
        return (
          <AddressStep
            data={form.address}
            errors={errors}
            onChange={v => updateForm('address', v)}
          />
        )
      case 4:
        return (
          <FinancialStep
            data={form.financial}
            countries={countries}
            errors={errors}
            onChange={v => updateForm('financial', v)}
          />
        )
      case 5:
        return (
          <TaxStep
            organization={form.organization}
            taxConfig={form.tax_configuration}
            taxLabel={taxPreview?.taxProfile.taxRegistrationLabel ?? form.tax_configuration.taxRegistrationLabel}
            taxRequired={taxPreview?.taxProfile.taxRegistrationRequired}
            errors={errors}
            onChangeOrg={v => updateForm('organization', v)}
          />
        )
      case 6:
        return (
          <ErpSettingsStep
            data={form.erp_settings}
            onChange={v => updateForm('erp_settings', v)}
          />
        )
      case 7:
        return <ReviewStep form={form} />
      default:
        return null
    }
  }

  const isLast = step === ONBOARDING_STEPS.length - 1

  return (
    <div className="auth-page auth-font min-h-screen flex items-center justify-center p-4">
      <div className="auth-card bg-white dark:bg-slate-900 rounded-xl overflow-hidden max-w-3xl w-full relative z-10">
        <div className={`p-8 sm:p-10 ${step === 0 ? 'sm:min-w-[520px]' : ''}`}>
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Building2 size={16} color="white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Set up your organization</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Step {step + 1} of {ONBOARDING_STEPS.length} — {ONBOARDING_STEPS[step]}</p>
            </div>
          </div>

          <div className="flex gap-1 mb-8">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}
              />
            ))}
          </div>

          <div className={step === 0 ? 'min-h-[360px]' : 'min-h-[280px]'}>{renderStep()}</div>

          {submitError && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-4">{submitError}</p>
          )}

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            {step > 0 ? (
              <button type="button" onClick={back} className="auth-ghost px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 flex items-center gap-1">
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            {isLast ? (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="auth-btn flex-1 py-3 rounded-lg text-sm font-bold text-white bg-brand-500 flex items-center justify-center gap-2 ml-auto"
              >
                {submitting ? 'Creating…' : <><Check size={16} /> Complete Setup</>}
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                disabled={loadingPreview}
                className="auth-btn flex-1 py-3 rounded-lg text-sm font-bold text-white bg-brand-500 flex items-center justify-center gap-2 ml-auto max-w-xs"
              >
                Continue <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
