import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@workspace/ui/components/sidebar'
import { useState } from 'react'
import { EmailLogin } from '@/components/auth/email-login'
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
            <div className="
              bg-background flex min-h-screen items-center justify-center
            "
            >
              <div className="
                border-primary h-8 w-8 animate-spin rounded-full border-b-2
              "
              />
            </div>
          )
        : session.data
          ? (
              <SidebarProvider>
                <div className="
                  bg-background flex h-screen w-full overflow-hidden
                "
                >
                  <Sidebar />
                  <MobileSidebar
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                  />

                  <SidebarInset className="flex flex-col overflow-hidden">
                    <Header
                      onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    />

                    <main className="bg-muted/20 flex-1 overflow-y-auto p-6">
                      <div className="mx-auto max-w-7xl">
                        <Outlet />
                      </div>
                    </main>
                  </SidebarInset>
                </div>
              </SidebarProvider>
            )
          : (
              <EmailLogin />
            )}
    </>
  )
}
