import { BUSINESS_TYPES, type OrganizationSection } from '../../types/organisationOnboarding'
import { onboardingInputClass, onboardingLabelClass } from './onboardingStyles'

interface Props {
  data: OrganizationSection
  errors: Record<string, string>
  onChange: (data: OrganizationSection) => void
}

export function OrganizationStep({ data, errors, onChange }: Props) {
  const set = (k: keyof OrganizationSection, v: string) => onChange({ ...data, [k]: v })

  const handleLogo = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange({ ...data, logo: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={onboardingLabelClass}>Organization Name *</label>
          <input className={`${onboardingInputClass} ${errors['organization.name'] ? 'border-red-400 dark:border-red-500/50' : ''}`} value={data.name} onChange={e => set('name', e.target.value)} />
          {errors['organization.name'] && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors['organization.name']}</p>}
        </div>
        <div>
          <label className={onboardingLabelClass}>Legal Business Name</label>
          <input className={onboardingInputClass} value={data.legalBusinessName} onChange={e => set('legalBusinessName', e.target.value)} />
        </div>
        <div>
          <label className={onboardingLabelClass}>Company Registration Number</label>
          <input className={onboardingInputClass} value={data.companyRegistrationNumber} onChange={e => set('companyRegistrationNumber', e.target.value)} />
        </div>
        <div>
          <label className={onboardingLabelClass}>Industry</label>
          <input className={onboardingInputClass} value={data.industry} onChange={e => set('industry', e.target.value)} placeholder="e.g. Retail, Manufacturing" />
        </div>
        <div>
          <label className={onboardingLabelClass}>Business Type</label>
          <select className={onboardingInputClass} value={data.businessType} onChange={e => set('businessType', e.target.value)}>
            {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={onboardingLabelClass}>Website</label>
          <input className={onboardingInputClass} type="url" value={data.website} onChange={e => set('website', e.target.value)} placeholder="https://" />
        </div>
        <div>
          <label className={onboardingLabelClass}>Organization Logo</label>
          <input className={`${onboardingInputClass} file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:text-slate-700 dark:file:bg-slate-700 dark:file:text-slate-200`} type="file" accept="image/*" onChange={e => handleLogo(e.target.files?.[0] ?? null)} />
        </div>
      </div>
    </div>
  )
}
