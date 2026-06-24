import type { AddressSection } from '../../types/organisationOnboarding'
import { onboardingInfoBoxClass, onboardingInputClass, onboardingLabelClass } from './onboardingStyles'

interface Props {
  data: AddressSection
  errors: Record<string, string>
  onChange: (data: AddressSection) => void
}

export function AddressStep({ data, errors, onChange }: Props) {
  const set = (k: keyof AddressSection, v: string) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-4">
      <div className={onboardingInfoBoxClass}>
        Country: <strong className="text-slate-800 dark:text-slate-100">{data.country || '—'}</strong> ({data.countryCode})
      </div>
      <div>
        <label className={onboardingLabelClass}>Address Line 1 *</label>
        <input className={`${onboardingInputClass} ${errors['address.addressLine1'] ? 'border-red-400 dark:border-red-500/50' : ''}`} value={data.addressLine1} onChange={e => set('addressLine1', e.target.value)} />
        {errors['address.addressLine1'] && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors['address.addressLine1']}</p>}
      </div>
      <div>
        <label className={onboardingLabelClass}>Address Line 2</label>
        <input className={onboardingInputClass} value={data.addressLine2} onChange={e => set('addressLine2', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={onboardingLabelClass}>City *</label>
          <input className={`${onboardingInputClass} ${errors['address.city'] ? 'border-red-400 dark:border-red-500/50' : ''}`} value={data.city} onChange={e => set('city', e.target.value)} />
          {errors['address.city'] && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors['address.city']}</p>}
        </div>
        <div>
          <label className={onboardingLabelClass}>State / Province</label>
          <input className={onboardingInputClass} value={data.stateProvince} onChange={e => set('stateProvince', e.target.value)} />
        </div>
        <div>
          <label className={onboardingLabelClass}>Postal / ZIP Code *</label>
          <input className={`${onboardingInputClass} ${errors['address.postalCode'] ? 'border-red-400 dark:border-red-500/50' : ''}`} value={data.postalCode} onChange={e => set('postalCode', e.target.value)} />
          {errors['address.postalCode'] && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors['address.postalCode']}</p>}
        </div>
      </div>
    </div>
  )
}
