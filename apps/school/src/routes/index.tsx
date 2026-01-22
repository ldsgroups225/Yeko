import { IconSchool, IconChevronRight } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-card rounded-xl shadow-lg border border-border/50 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative bg-primary/10 p-4 rounded-2xl ring-1 ring-primary/20">
                  <IconSchool className="w-12 h-12 text-primary" stroke={1.5} />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Yeko School
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Smart School Management System
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/accounting/dashboard"
                className="group relative flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200 ease-out"
              >
                <span>Accounting Dashboard</span>
                <IconChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Built with care for modern education
        </p>
      </div>
    </main>
  )
}
