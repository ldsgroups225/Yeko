import { IconCreditCard, IconMail, IconMapPin, IconPhone, IconSchool, IconUsers } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

interface SchoolInfoTabProps {
  school: {
    address: string | null
    phone: string | null
    email: string | null
  }
}

export function SchoolInfoTab({ school }: SchoolInfoTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <IconMapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Adresse</p>
              <p className="text-sm text-muted-foreground">{school.address || 'Non renseignée'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IconPhone className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Téléphone</p>
              <p className="text-sm text-muted-foreground">{school.phone || 'Non renseigné'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IconMail className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Email</p>
              <p className="text-sm text-muted-foreground">{school.email || 'Non renseigné'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Statistiques Rapides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconUsers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Élèves inscrits</span>
            </div>
            <span className="font-bold">--</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconSchool className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Enseignants</span>
            </div>
            <span className="font-bold">--</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconCreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Paiements (Mois)</span>
            </div>
            <span className="font-bold">--</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
