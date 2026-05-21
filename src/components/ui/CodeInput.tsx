import { useEffect } from 'react'
import { Zap, Lock } from 'lucide-react'
import { cn } from '../../lib/cn'
import { CodeComponent } from '../../services/codeSettingService'
import { useCodeSettings, useCodePreview } from '../../hooks/useCodeSetting'

interface CodeInputProps {
  component: CodeComponent
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
  /** Called once the auto-generated code is loaded, so the parent form can pre-fill it */
  onAutoCode?: (code: string) => void
}

/**
 * Smart code input that respects the organisation's code generation settings.
 *
 * - If the component is configured as "dynamic": shows a read-only badge with the
 *   auto-generated preview and calls `onAutoCode` when ready.
 * - If the component is configured as "static": renders a normal editable input.
 */
export function CodeInput({
  component,
  value,
  onChange,
  error,
  disabled,
  placeholder = 'Enter code',
  onAutoCode,
}: CodeInputProps) {
  const { data: setting, isLoading: loadingSettings } = useCodeSettings(component)
  const isAuto = setting?.is_auto ?? false

  const { data: preview, isLoading: loadingPreview } = useCodePreview(component, isAuto)

  // When auto-generated code is ready, push it up to the parent form
  useEffect(() => {
    if (isAuto && preview?.code && onAutoCode) {
      onAutoCode(preview.code)
    }
  }, [isAuto, preview?.code, onAutoCode])

  // ── Auto / Dynamic Mode ──────────────────────────────────────────────────
  if (!loadingSettings && isAuto) {
    return (
      <div className="flex flex-col gap-1.5">
        <div
          className={cn(
            'h-9 w-full rounded-lg border border-brand-200 dark:border-brand-700/60',
            'bg-brand-50 dark:bg-brand-900/20 px-3 flex items-center justify-between',
            'text-sm font-mono font-semibold text-brand-700 dark:text-brand-400',
          )}
        >
          <span>
            {loadingPreview ? (
              <span className="inline-block w-20 h-4 bg-brand-200 dark:bg-brand-800 animate-pulse rounded" />
            ) : (
              preview?.code ?? '—'
            )}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-brand-500 dark:text-brand-400 uppercase tracking-widest">
            <Zap className="w-3 h-3" />
            Auto
          </span>
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      </div>
    )
  }

  // ── Static / Manual Mode ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled || loadingSettings}
          placeholder={loadingSettings ? 'Loading…' : placeholder}
          className={cn(
            'h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700',
            'bg-white dark:bg-slate-900 px-3 pr-8 text-sm text-slate-900 dark:text-slate-100',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            'disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-500',
            error && 'border-red-400 dark:border-red-500/60 focus:ring-red-400',
          )}
        />
        {!loadingSettings && (
          <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
        )}
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
