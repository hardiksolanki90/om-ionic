import type { ErpSettingsSection } from '../../types/organisationOnboarding'
import { onboardingCheckboxLabelClass, onboardingInputClass, onboardingLabelClass } from './onboardingStyles'

interface Props {
  data: ErpSettingsSection
  onChange: (data: ErpSettingsSection) => void
}

export function ErpSettingsStep({ data, onChange }: Props) {
  const set = (k: keyof ErpSettingsSection, v: string | boolean | null) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={onboardingLabelClass}>Default Warehouse</label>
          <input className={onboardingInputClass} value={data.defaultWarehouse} onChange={e => set('defaultWarehouse', e.target.value)} />
        </div>
        <div>
          <label className={onboardingLabelClass}>Default Cost Center</label>
          <input className={onboardingInputClass} value={data.defaultCostCenter ?? ''} onChange={e => set('defaultCostCenter', e.target.value || null)} />
        </div>
        <div>
          <label className={onboardingLabelClass}>Default Branch</label>
          <input className={onboardingInputClass} value={data.defaultBranch ?? ''} onChange={e => set('defaultBranch', e.target.value || null)} />
        </div>
        <div>
          <label className={onboardingLabelClass}>Default Payment Terms</label>
          <input className={onboardingInputClass} value={data.defaultPaymentTerms ?? ''} onChange={e => set('defaultPaymentTerms', e.target.value || null)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-6 pt-2">
        {([
          ['multiCurrencyEnabled', 'Multi-Currency'],
          ['multiBranchEnabled', 'Multi-Branch'],
          ['multiWarehouseEnabled', 'Multi-Warehouse'],
        ] as const).map(([key, label]) => (
          <label key={key} className={onboardingCheckboxLabelClass}>
            <input type="checkbox" checked={data[key]} onChange={e => set(key, e.target.checked)} className="rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800" />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}
