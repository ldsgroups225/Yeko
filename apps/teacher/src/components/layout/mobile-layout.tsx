import type { ReactNode } from 'react'
import { BottomNavigation } from './bottom-navigation'

interface MobileLayoutProps {
  children: ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="safe-area-bottom flex-1">{children}</main>
      <BottomNavigation />
    </div>
  )
}
