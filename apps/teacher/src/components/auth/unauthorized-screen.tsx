import { IconLogout, IconRefresh, IconSchool } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useI18nContext } from '@/i18n/i18n-react'
import { authClient } from '@/lib/auth-client'

export function UnauthorizedScreen() {
  const { LL } = useI18nContext()

  const handleLogout = async () => {
    await authClient.signOut()
    window.location.href = '/login'
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="
      bg-background flex min-h-screen items-center justify-center p-4
    "
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="
            bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center
            justify-center rounded-full
          "
          >
            <IconSchool className="text-destructive h-6 w-6" />
          </div>
          <CardTitle className="text-xl">{LL.unauthorized.title()}</CardTitle>
          <CardDescription>
            {LL.unauthorized.description()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-center text-sm">
            {LL.unauthorized.message()}
          </p>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleLogout}>
            <IconLogout className="mr-2 h-4 w-4" />
            {LL.auth.logout()}
          </Button>
          <Button className="flex-1" onClick={handleRefresh}>
            <IconRefresh className="mr-2 h-4 w-4" />
            {LL.common.refresh()}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
