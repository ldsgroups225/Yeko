import { IconCalendar } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'

export function SchoolYearsTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Années Scolaires</CardTitle>
            <CardDescription>Historique et configuration des années scolaires.</CardDescription>
          </div>
          <Button>
            <IconCalendar className="h-4 w-4 mr-2" />
            Nouvelle année
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Année en cours</h3>
                    <Badge>Actif</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Configuration de l'année académique actuelle</p>
                </div>
                <Button variant="outline" size="sm">Configurer</Button>
              </div>
            </CardContent>
          </Card>
          <Separator />
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <IconCalendar className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Aucune année scolaire configurée</p>
            <p className="text-sm">Créez votre première année scolaire pour commencer</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
