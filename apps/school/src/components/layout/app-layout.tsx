import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Header } from './header'
import { AppSidebar } from './sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
