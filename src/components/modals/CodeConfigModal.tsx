import { useState, useEffect } from 'react'
import { X, Zap, Hash } from 'lucide-react'
import { cn } from '../../lib/cn'
import { CodeComponent, CodeSetting, UpdateCodeSettingPayload } from '../../services/codeSettingService'
import { useUpdateCodeSetting } from '../../hooks/useCodeSetting'

interface CodeConfigModalProps {
  component: CodeComponent
  setting: CodeSetting
  open: boolean
  onClose: () => void
}

const COMPONENT_LABELS: Record<CodeComponent, string> = {
  area: 'Areas',
  brand: 'Brands',
  category: 'Categories',
  customer: 'Customers',
  item: 'Items',
  order: 'Orders',
  return: 'Returns',
  salesman: 'Salesmen',
  route: 'Routes',
  uom: 'UOMs',
  warehouse: 'Warehouses',
}

export function CodeConfigModal({ component, setting, open, onClose }: CodeConfigModalProps) {
  const [isAuto, setIsAuto] = useState(setting.is_auto)
  const [prefix, setPrefix] = useState(setting.prefix ?? '')
  const [separator, setSeparator] = useState(setting.separator ?? '-')
  const [padding, setPadding] = useState(setting.padding)
  const [startingNumber, setStartingNumber] = useState(setting.starting_number)

  const updateMutation = useUpdateCodeSetting(component)

  // Preview what the code will look like
  const preview = (() => {
    if (!isAuto) return 'Manual Entry'
    const padded = String(startingNumber).padStart(padding, '0')
    if (!prefix) return padded
    return `${prefix}${separator}${padded}`
  })()

  useEffect(() => {
    if (open) {
      setIsAuto(setting.is_auto)
      setPrefix(setting.prefix ?? '')
      setSeparator(setting.separator ?? '-')
      setPadding(setting.padding)
      setStartingNumber(setting.starting_number)
    }
  }, [open, setting])

  const handleSave = () => {
    const payload: UpdateCodeSettingPayload = {
      is_auto: isAuto,
      prefix: isAuto ? (prefix.trim() || null) : null,
      separator: isAuto ? (separator || '-') : '-',
      padding,
      starting_number: startingNumber,
    }

    updateMutation.mutate(payload, {
      onSuccess: () => onClose(),
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Code Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {COMPONENT_LABELS[component]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Mode Toggle */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
              Generation Mode
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsAuto(true)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-semibold',
                  isAuto
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                )}
              >
                <Zap className="w-5 h-5" />
                Dynamic
                <span className="text-[10px] font-normal text-current opacity-70">Auto Generated</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAuto(false)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-semibold',
                  !isAuto
                    ? 'border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300'
                )}
              >
                <Hash className="w-5 h-5" />
                Static
                <span className="text-[10px] font-normal text-current opacity-70">Manual Entry</span>
              </button>
            </div>
          </div>

          {/* Dynamic Config Fields */}
          {isAuto && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Prefix <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={e => setPrefix(e.target.value.toUpperCase())}
                    placeholder="e.g. ITEM"
                    maxLength={20}
                    className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Separator
                  </label>
                  <select
                    value={separator}
                    onChange={e => setSeparator(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="-">- (Hyphen)</option>
                    <option value="/">&frasl; (Slash)</option>
                    <option value="_">_ (Underscore)</option>
                    <option value="">None</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Padding (digits)
                  </label>
                  <input
                    type="number"
                    value={padding}
                    onChange={e => setPadding(Math.max(1, Math.min(10, Number(e.target.value))))}
                    min={1}
                    max={10}
                    className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Starting Number
                  </label>
                  <input
                    type="number"
                    value={startingNumber}
                    onChange={e => setStartingNumber(Math.max(1, Number(e.target.value)))}
                    min={1}
                    className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Preview
                </p>
                <p className="text-base font-mono font-bold text-brand-600 dark:text-brand-400">
                  {preview}
                </p>
              </div>
            </div>
          )}

          {!isAuto && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 px-4 py-4 text-center">
              <Hash className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Users will manually enter the code when creating records.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="h-9 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-sm font-semibold text-white transition-colors"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  )
}
