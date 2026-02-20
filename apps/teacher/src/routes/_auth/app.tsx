import { IconHome } from '@tabler/icons-react'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { useI18nContext } from '@/i18n/i18n-react'

export const Route = createFileRoute('/_auth/app')({
  component: AppLayout,
  notFoundComponent: NotFoundComponent,
})

function NotFoundComponent() {
  const { LL } = useI18nContext()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="text-xl text-muted-foreground">{LL.errors.notFound()}</p>
        <Button
          render={(
            <Link to="/app">
              <IconHome className="mr-2 h-4 w-4" />
              {LL.nav.home()}
            </Link>
          )}
        />
      </div>
    </div>
  )
}

function AppLayout() {
  return (
    <MobileLayout>
      <Outlet />
    </MobileLayout>
  )
}
