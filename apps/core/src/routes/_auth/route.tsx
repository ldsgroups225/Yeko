import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@workspace/ui/components/sidebar'
import { useState } from 'react'
import { GoogleLogin } from '@/components/auth/google-login'
import { Header } from '@/components/layout/header'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import { Sidebar } from '@/components/layout/sidebar'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const session = authClient.useSession()

  return (
    <>
      {session.isPending
        ? (
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )
        : session.data
          ? (
              <SidebarProvider>
                <div className="flex h-screen w-full bg-background overflow-hidden">
                  <Sidebar />
                  <MobileSidebar
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                  />

                  <SidebarInset className="flex flex-col overflow-hidden">
                    <Header
                      onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    />

                    <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                      <div className="mx-auto max-w-7xl">
                        <Outlet />
                      </div>
                    </main>
                  </SidebarInset>
                </div>
              </SidebarProvider>
            )
          : (
              <GoogleLogin />
            )}
    </>
  )
}
