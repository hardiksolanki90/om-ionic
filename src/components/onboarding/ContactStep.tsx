import type { ContactSection } from '../../types/organisationOnboarding'
import { onboardingInputClass, onboardingLabelClass } from './onboardingStyles'

interface Props {
  data: ContactSection
  errors: Record<string, string>
  onChange: (data: ContactSection) => void
}

export function ContactStep({ data, errors, onChange }: Props) {
  const set = (k: keyof ContactSection, v: string) => onChange({ ...data, [k]: v })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className={onboardingLabelClass}>Primary Contact Name *</label>
        <input className={`${onboardingInputClass} ${errors['contact.primaryContactName'] ? 'border-red-400 dark:border-red-500/50' : ''}`} value={data.primaryContactName} onChange={e => set('primaryContactName', e.target.value)} />
        {errors['contact.primaryContactName'] && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors['contact.primaryContactName']}</p>}
      </div>
      <div>
        <label className={onboardingLabelClass}>Designation</label>
        <input className={onboardingInputClass} value={data.designation} onChange={e => set('designation', e.target.value)} />
      </div>
      <div>
        <label className={onboardingLabelClass}>Email *</label>
        <input className={`${onboardingInputClass} ${errors['contact.email'] ? 'border-red-400 dark:border-red-500/50' : ''}`} type="email" value={data.email} onChange={e => set('email', e.target.value)} />
        {errors['contact.email'] && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors['contact.email']}</p>}
      </div>
      <div>
        <label className={onboardingLabelClass}>Mobile *</label>
        <input className={`${onboardingInputClass} ${errors['contact.mobile'] ? 'border-red-400 dark:border-red-500/50' : ''}`} value={data.mobile} onChange={e => set('mobile', e.target.value)} />
        {errors['contact.mobile'] && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors['contact.mobile']}</p>}
      </div>
      <div className="sm:col-span-2">
        <label className={onboardingLabelClass}>Alternate Phone</label>
        <input className={onboardingInputClass} value={data.alternatePhone} onChange={e => set('alternatePhone', e.target.value)} />
      </div>
    </div>
  )
}
