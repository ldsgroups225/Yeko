import type { ReactNode } from 'react'
import { BottomNavigation } from './bottom-navigation'

interface MobileLayoutProps {
  children: ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 safe-area-bottom">{children}</main>
      <BottomNavigation />
    </div>
  )
}
