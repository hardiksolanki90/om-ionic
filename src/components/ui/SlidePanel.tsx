import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

interface SlidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '400' | '500' | 'full'
  pageMode?: boolean
}

const widths = {
  'xs': 'sm:max-w-xs',
  'sm': 'sm:max-w-sm',
  'md': 'sm:max-w-md',
  'lg': 'sm:max-w-lg',
  'xl': 'sm:max-w-xl',
  '400': 'sm:max-w-[400px]',
  '500': 'sm:max-w-[500px]',
  'full': 'sm:max-w-full',
}

export function SlidePanel({ isOpen, onClose, title, subtitle, children, footer, width = 'lg', pageMode = false }: SlidePanelProps) {
  useEffect(() => {
    if (!pageMode && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen, pageMode])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-900 z-10 flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-4 mt-0.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto py-5 px-6 scrollbar-thin bg-white dark:bg-slate-900 min-h-0">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 flex items-center gap-3 justify-between flex-shrink-0">
          {footer}
        </div>
      )}
    </>
  )

  if (pageMode) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-900">
        {panelContent}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop — hidden on mobile since panel is full-width */}
      <div
        className="hidden sm:block flex-1 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Panel — full-width on mobile, max-width on sm+ */}
      <div className={cn(
        'relative flex flex-col bg-white dark:bg-slate-900 shadow-2xl w-full animate-slide-in overflow-hidden border-l border-slate-200 dark:border-slate-700/60',
        widths[width]
      )}>
        {panelContent}
      </div>
    </div>
  )
}
