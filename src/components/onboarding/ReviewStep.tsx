import type { OnboardingFormState } from '../../types/organisationOnboarding'

interface Props {
  form: OnboardingFormState
}

export function ReviewStep({ form }: Props) {
  const rows = [
    ['Organization', form.organization.name],
    ['Country', form.address.country],
    ['Contact', `${form.contact.primaryContactName} (${form.contact.email})`],
    ['Currency', `${form.financial.baseCurrency} (${form.financial.currencySymbol})`],
    ['Tax System', form.tax_configuration.taxSystem],
    ['Warehouse', form.erp_settings.defaultWarehouse],
  ]

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
              <td className="px-4 py-2.5 font-medium text-slate-500 dark:text-slate-400 w-1/3">{label}</td>
              <td className="px-4 py-2.5 text-slate-800 dark:text-slate-100">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
