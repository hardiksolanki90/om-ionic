import React, { createContext, useContext, useRef, useState, useCallback } from 'react'
import { IonLoading } from '@ionic/react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type LoaderSize = 'small' | 'medium' | 'large' | 'extra-large'

interface LoadingContextValue {
  /** Manually show the loader */
  show: (size?: LoaderSize, message?: string) => void
  /** Manually hide the loader */
  hide: () => void
  /** Wrap a promise: shows loader while it runs, hides when done */
  showFor: <T>(promise: Promise<T>, size?: LoaderSize, message?: string) => Promise<T>
  isLoading: boolean
}

// ─── Spinner size → CSS class map ─────────────────────────────────────────────
const SIZE_CLASSES: Record<LoaderSize, string> = {
  'small':       'loader-small',
  'medium':      'loader-medium',
  'large':       'loader-large',
  'extra-large': 'loader-xl',
}

// ─── Context ──────────────────────────────────────────────────────────────────
const LoadingContext = createContext<LoadingContextValue | null>(null)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen]       = useState(false)
  const [message, setMessage]     = useState<string | undefined>(undefined)
  const [cssClass, setCssClass]   = useState<string>('loader-medium')

  // Track concurrent requests so we only hide when ALL are done
  const activeCount = useRef(0)

  const show = useCallback((size: LoaderSize = 'medium', msg?: string) => {
    activeCount.current += 1
    setCssClass(SIZE_CLASSES[size])
    setMessage(msg)
    setIsOpen(true)
  }, [])

  const hide = useCallback(() => {
    activeCount.current = Math.max(0, activeCount.current - 1)
    if (activeCount.current === 0) {
      setIsOpen(false)
    }
  }, [])

  const showFor = useCallback(
    async <T,>(promise: Promise<T>, size: LoaderSize = 'medium', msg?: string): Promise<T> => {
      show(size, msg)
      try {
        return await promise
      } finally {
        hide()
      }
    },
    [show, hide]
  )

  return (
    <LoadingContext.Provider value={{ show, hide, showFor, isLoading: isOpen }}>
      {children}
      <IonLoading
        isOpen={isOpen}
        message={message}
        cssClass={cssClass}
        backdropDismiss={false}
      />
    </LoadingContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLoading(): LoadingContextValue {
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading must be used inside <LoadingProvider>')
  return ctx
}
