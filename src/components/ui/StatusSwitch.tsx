import { cn } from '../../lib/cn'

interface StatusSwitchProps {
  value: boolean
  onChange: (v: boolean) => void
  className?: string
}

export function StatusSwitch({ value, onChange, className }: StatusSwitchProps) {
  return (
    <label className={cn('flex items-center gap-2.5 cursor-pointer select-none', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1',
          value ? 'bg-brand-500' : 'bg-slate-300'
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
          value ? 'translate-x-4' : 'translate-x-0'
        )} />
      </button>
      <span className={cn('text-sm font-medium', value ? 'text-slate-700' : 'text-slate-400')}>
        {value ? 'Active' : 'Inactive'}
      </span>
    </label>
  )
}
