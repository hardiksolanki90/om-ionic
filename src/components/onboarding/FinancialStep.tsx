import { useMemo } from 'react'
import {
  buildCurrencyOptions,
  FINANCIAL_YEAR_FORMATS,
  NUMBER_FORMATS,
  symbolForCurrency,
  type Country,
  type FinancialSection,
} from '../../types/organisationOnboarding'
import { onboardingInputClass, onboardingLabelClass } from './onboardingStyles'

interface Props {
  data: FinancialSection
  countries: Country[]
  errors: Record<string, string>
  onChange: (data: FinancialSection) => void
}

const disabledClass =
  'disabled:opacity-80 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/80'

export function FinancialStep({ data, countries, errors, onChange }: Props) {
  const currencyOptions = useMemo(() => buildCurrencyOptions(countries), [countries])

  const set = (k: keyof FinancialSection, v: string) => onChange({ ...data, [k]: v })

  const handleCurrencyChange = (code: string) => {
    onChange({
      ...data,
      baseCurrency: code,
      currencySymbol: symbolForCurrency(code, currencyOptions),
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className={onboardingLabelClass}>Base Currency *</label>
        <select
          className={`${onboardingInputClass} ${ errors['financial.baseCurrency'] ? 'border-red-400 dark:border-red-500/50' : ''}`}
          value={data.baseCurrency}
          onChange={e => handleCurrencyChange(e.target.value)}
        >
          <option value="">Select currency</option>
          {currencyOptions.map(c => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name}
            </option>
          ))}
          {data.baseCurrency && !currencyOptions.some(c => c.code === data.baseCurrency) && (
            <option value={data.baseCurrency}>{data.baseCurrency}</option>
          )}
        </select>
        { errors['financial.baseCurrency'] && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">{ errors['financial.baseCurrency']}</p>
        )}
      </div>
      <div>
        <label className={onboardingLabelClass}>Currency Symbol</label>
        <input
          className={`${onboardingInputClass} ${disabledClass}`}
          value={data.currencySymbol}
          disabled
          readOnly
          aria-readonly="true"
          placeholder="Auto from currency"
        />
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Set automatically from base currency</p>
      </div>
      <div>
        <label className={onboardingLabelClass}>Fiscal Year Start</label>
        <input className={onboardingInputClass} placeholder="MM-DD" value={data.fiscalYearStart} onChange={e => set('fiscalYearStart', e.target.value)} />
      </div>
      <div>
        <label className={onboardingLabelClass}>Fiscal Year End</label>
        <input className={onboardingInputClass} placeholder="MM-DD" value={data.fiscalYearEnd} onChange={e => set('fiscalYearEnd', e.target.value)} />
      </div>
      <div>
        <label className={onboardingLabelClass}>Financial Year Format</label>
        <select
          className={onboardingInputClass}
          value={data.financialYearFormat}
          onChange={e => set('financialYearFormat', e.target.value)}
        >
          {!FINANCIAL_YEAR_FORMATS.some(f => f.value === data.financialYearFormat) && data.financialYearFormat && (
            <option value={data.financialYearFormat}>{data.financialYearFormat}</option>
          )}
          {FINANCIAL_YEAR_FORMATS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={onboardingLabelClass}>Number Format</label>
        <select
          className={onboardingInputClass}
          value={data.numberFormat}
          onChange={e => set('numberFormat', e.target.value)}
        >
          {!NUMBER_FORMATS.some(f => f.value === data.numberFormat) && data.numberFormat && (
            <option value={data.numberFormat}>{data.numberFormat}</option>
          )}
          {NUMBER_FORMATS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={onboardingLabelClass}>Date Format</label>
        <input className={onboardingInputClass} value={data.dateFormat} onChange={e => set('dateFormat', e.target.value)} />
      </div>
      <div>
        <label className={onboardingLabelClass}>Timezone</label>
        <input className={onboardingInputClass} value={data.timezone} onChange={e => set('timezone', e.target.value)} />
      </div>
      <div>
        <label className={onboardingLabelClass}>Language</label>
        <input
          className={`${onboardingInputClass} ${disabledClass}`}
          value={data.language}
          disabled
          readOnly
          aria-readonly="true"
          placeholder="Auto from country"
        />
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Set automatically from country</p>
      </div>
    </div>
  )
}
