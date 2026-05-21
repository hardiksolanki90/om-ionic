import React from 'react'
import { TopBar } from '../components/TopBar'

interface PageLayoutProps {
  children: React.ReactNode
  /** Extra classes for the scrollable content wrapper */
  className?: string
  noScroll?: boolean
}

/**
 * Page shell: TopBar + scrollable content area.
 * Plain CSS flex — no IonPage/IonContent — works correctly inside
 * BrowserRouter + IonSplitPane without requiring IonRouterOutlet.
 */
export function PageLayout({ children, className = '', noScroll = false }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <TopBar />
      {noScroll ? (
        <div className={`flex-1 min-h-0 flex flex-col ${className}`}>
          {children}
        </div>
      ) : (
        <div className={`flex-1 overflow-y-auto overscroll-contain ${className}`}>
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
