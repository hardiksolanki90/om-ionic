import type { OrganizationSection, TaxConfigurationSection } from '../../types/organisationOnboarding'
import {
  onboardingInputClass,
  onboardingLabelClass,
  onboardingStatCardClass,
  onboardingStatLabelClass,
  onboardingStatValueClass,
} from './onboardingStyles'

interface Props {
  organization: OrganizationSection
  taxConfig: TaxConfigurationSection
  taxLabel: string
  taxRequired?: boolean
  errors: Record<string, string>
  onChangeOrg: (data: OrganizationSection) => void
}

export function TaxStep({ organization, taxConfig, taxLabel, taxRequired, errors, onChangeOrg }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div className={onboardingStatCardClass}>
          <div className={onboardingStatLabelClass}>Tax System</div>
          <div className={`${onboardingStatValueClass} capitalize`}>{taxConfig.taxSystem}</div>
        </div>
        <div className={onboardingStatCardClass}>
          <div className={onboardingStatLabelClass}>Input Tax Credit</div>
          <div className={onboardingStatValueClass}>{taxConfig.inputTaxCreditSupport ? 'Yes' : 'No'}</div>
        </div>
        <div className={onboardingStatCardClass}>
          <div className={onboardingStatLabelClass}>Multi-Tax</div>
          <div className={onboardingStatValueClass}>{taxConfig.multiTaxSupport ? 'Yes' : 'No'}</div>
        </div>
      </div>

      <div>
        <label className={onboardingLabelClass}>{taxLabel}{taxRequired ? ' *' : ''}</label>
        <input
          className={`${onboardingInputClass} ${errors['organization.taxRegistrationNumber'] ? 'border-red-400 dark:border-red-500/50' : ''}`}
          value={organization.taxRegistrationNumber}
          onChange={e => onChangeOrg({ ...organization, taxRegistrationNumber: e.target.value.toUpperCase() })}
          placeholder={`Enter ${taxLabel}`}
        />
        {errors['organization.taxRegistrationNumber'] && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors['organization.taxRegistrationNumber']}</p>}
      </div>

      {organization.taxType.length > 0 && (
        <div>
          <label className={onboardingLabelClass}>Supported Tax Types</label>
          <div className="flex flex-wrap gap-2">
            {organization.taxType.map(t => (
              <span key={t} className="px-2 py-1 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-medium uppercase">{t.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      )}

      {taxConfig.taxPercentageRules?.length > 0 && (
        <div>
          <label className={onboardingLabelClass}>Tax Rates (%)</label>
          <p className="text-sm text-slate-600 dark:text-slate-300">{taxConfig.taxPercentageRules.join('%, ')}%</p>
        </div>
      )}
    </div>
  )
}
