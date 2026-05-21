import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './Button'
import { Input } from './Input'
import { useCodeSettings, useUpdateCodeSetting } from '../../hooks/useCodeSetting'
import { CodeComponent } from '../../services/codeSettingService'
import { Loader2, X, Settings2, Zap, PencilLine } from 'lucide-react'
import { cn } from '../../lib/cn'

interface CodeSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  component: CodeComponent
  title: string
}

export function CodeSettingsModal({ isOpen, onClose, component, title }: CodeSettingsModalProps) {
  const { data: settings, isLoading } = useCodeSettings(component)
  const updateMutation = useUpdateCodeSetting(component)

  const [isAuto, setIsAuto] = useState(false)
  const [prefix, setPrefix] = useState('')
  const [range, setRange] = useState('1')

  useEffect(() => {
    if (isOpen && settings) {
      const current = settings
      setIsAuto(current.is_auto)
      setPrefix(current.prefix || '')
      setRange(String(current.starting_number || 1))
    }
  }, [isOpen, settings, component])

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      is_auto: isAuto,
      prefix: prefix || null,
      separator: '-',
      padding: 4,
      starting_number: Number(range) || 1,
    })
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content
          className={cn(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100vw-2rem)] max-w-lg max-h-[90vh]',
            'bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/60',
            'flex flex-col animate-in fade-in zoom-in-95 duration-200'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <Dialog.Title className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {title} Configuration
                </Dialog.Title>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage how identifiers are assigned.
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-brand-500 mb-3" />
                <p className="text-sm font-medium text-slate-500">Loading configuration...</p>
              </div>
            ) : (
              <div className="space-y-6">

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Generation Mode
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Auto-Generate Card */}
                    <button
                      type="button"
                      onClick={() => setIsAuto(true)}
                      className={cn(
                        'flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden',
                        isAuto
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center mb-1',
                        isAuto ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      )}>
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className={cn(
                        'text-sm font-semibold',
                        isAuto ? 'text-brand-900 dark:text-brand-100' : 'text-slate-700 dark:text-slate-300'
                      )}>
                        Auto-Generate
                      </span>
                      <span className={cn(
                        'text-xs leading-relaxed',
                        isAuto ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'
                      )}>
                        System creates a sequential code automatically.
                      </span>

                      {/* Active indicator ring inside card */}
                      {isAuto && (
                        <div className="absolute top-4 right-4 w-4 h-4 rounded-full border-[4px] border-brand-500 bg-white dark:bg-slate-900" />
                      )}
                      {!isAuto && (
                        <div className="absolute top-4 right-4 w-4 h-4 rounded-full border-[2px] border-slate-300 dark:border-slate-600 bg-transparent" />
                      )}
                    </button>

                    {/* Manual Card */}
                    <button
                      type="button"
                      onClick={() => setIsAuto(false)}
                      className={cn(
                        'flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden',
                        !isAuto
                          ? 'border-slate-800 dark:border-slate-200 bg-slate-50 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center mb-1',
                        !isAuto ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      )}>
                        <PencilLine className="w-4 h-4" />
                      </div>
                      <span className={cn(
                        'text-sm font-semibold',
                        !isAuto ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                      )}>
                        Manual Entry
                      </span>
                      <span className={cn(
                        'text-xs leading-relaxed',
                        !isAuto ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'
                      )}>
                        Users must manually type a unique code.
                      </span>

                      {/* Active indicator ring inside card */}
                      {!isAuto && (
                        <div className="absolute top-4 right-4 w-4 h-4 rounded-full border-[4px] border-slate-800 dark:border-slate-200 bg-white dark:bg-slate-900" />
                      )}
                      {isAuto && (
                        <div className="absolute top-4 right-4 w-4 h-4 rounded-full border-[2px] border-slate-300 dark:border-slate-600 bg-transparent" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Config Fields */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isAuto ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Sequence Formatting
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Prefix"
                        placeholder="e.g. CUST-"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                      />
                      <Input
                        label="Starting Range"
                        type="number"
                        min="1"
                        placeholder="e.g. 1000"
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                      />
                    </div>

                    {/* Live Preview Display */}
                    <div className="mt-2 flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Preview:</span>
                      <span className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
                        {prefix || ''}{String(range || 1).padStart(4, '0')}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending || isLoading}
              className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || isLoading}
              className="h-9 px-5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-sm font-semibold text-white shadow-sm shadow-brand-500/20 transition-all active:scale-[0.98]"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
