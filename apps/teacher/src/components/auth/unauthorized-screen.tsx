import { IconLogout, IconRefresh, IconSchool } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { authClient } from '@/lib/auth-client'

export function UnauthorizedScreen() {
  const handleLogout = async () => {
    await authClient.signOut()
    window.location.href = '/login'
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <IconSchool className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Accès Non Autorisé</CardTitle>
          <CardDescription>
            Votre compte n'est pas associé à un établissement scolaire actif en tant qu'enseignant.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-muted-foreground">
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur de votre établissement ou essayez d'actualiser la page.
          </p>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleLogout}>
            <IconLogout className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
          <Button className="flex-1" onClick={handleRefresh}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
