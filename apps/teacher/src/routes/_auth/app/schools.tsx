import { IconSchool, IconChevronRight, IconMapPin } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useTranslation } from 'react-i18next'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getTeacherSchoolsList } from '@/teacher/functions/users'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'

export const Route = createFileRoute('/_auth/app/schools')({
  component: SchoolsPage,
})

function SchoolsPage() {
  const { t } = useTranslation()

  const { data: schools } = useSuspenseQuery({
    queryKey: ['teacher-schools'],
    queryFn: () => getTeacherSchoolsList(),
  })

  return (
    <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.ecole', 'Mes Écoles')}</h1>
        <p className="text-muted-foreground">
          {t('schools.subtitle', 'Gérez vos classes et sessions dans vos différents établissements')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {schools?.map(school => (
          <Link
            key={school.id}
            to="/app/schools/$schoolId/classes"
            params={{ schoolId: school.id }}
            className="group"
          >
            <Card className="h-full hover:border-primary/50 transition-all cursor-pointer overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                  {school.logoUrl ? (
                    <AvatarImage src={school.logoUrl} alt={school.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {school.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg leading-tight truncate">{school.name}</CardTitle>
                    {school.status === 'active' ? (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] h-5">
                        {t('common.active', 'Actif')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] h-5">
                        {school.status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconMapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{school.address || t('common.noAddress', 'Adresse non renseignée')}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="border-t bg-muted/30 py-3 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  {t('common.viewDetails', 'Voir les détails')}
                </span>
                <IconChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </CardContent>
            </Card>
          </Link>
        ))}

        {schools?.length === 0 && (
          <Card className="col-span-full border-dashed p-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="p-3 bg-muted rounded-full">
              <IconSchool className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium">{t('schools.empty', 'Aucun établissement lié')}</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t('schools.emptyDesc', "Vous n'êtes actuellement rattaché à aucun établissement scolaire.")}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
