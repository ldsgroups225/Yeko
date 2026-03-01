import { IconEdit } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'

interface SchoolSettingsTabProps {
  settings: any
}

export function SchoolSettingsTab({ settings }: SchoolSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Configuration de l'École</CardTitle>
            <CardDescription>Paramètres spécifiques et fonctionnalités activées.</CardDescription>
          </div>
          <Button variant="outline">
            <IconEdit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="mb-3 text-sm font-medium">Modules Activés</h3>
              <div className="
                grid gap-3
                md:grid-cols-2
              "
              >
                <div className="
                  flex items-center justify-between rounded-lg border p-3
                "
                >
                  <span className="text-sm">Gestion des notes</span>
                  <Badge variant="outline">Activé</Badge>
                </div>
                <div className="
                  flex items-center justify-between rounded-lg border p-3
                "
                >
                  <span className="text-sm">Gestion des absences</span>
                  <Badge variant="outline">Activé</Badge>
                </div>
                <div className="
                  flex items-center justify-between rounded-lg border p-3
                "
                >
                  <span className="text-sm">Paiements en ligne</span>
                  <Badge variant="secondary">Désactivé</Badge>
                </div>
                <div className="
                  flex items-center justify-between rounded-lg border p-3
                "
                >
                  <span className="text-sm">Messagerie</span>
                  <Badge variant="outline">Activé</Badge>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="mb-3 text-sm font-medium">Paramètres Avancés</h3>
              <div className="bg-muted rounded-lg p-4">
                <details className="cursor-pointer">
                  <summary className="text-sm font-medium">Voir la configuration JSON</summary>
                  <pre className="mt-2 overflow-auto font-mono text-xs">
                    {JSON.stringify(settings, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
