import { IconBuilding, IconChevronRight, IconMapPin, IconPhone } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { getTeacherSchoolsQuery } from '@/teacher/functions/schools'

export const Route = createFileRoute('/_auth/app/schools')({
  component: SchoolsPage,
})

function SchoolsPage() {
  const { t } = useTranslation()
  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['teacher', 'schools', context?.userId],
    queryFn: () => getTeacherSchoolsQuery({ data: { userId: context?.userId ?? '' } }),
    enabled: !!context?.userId,
  })

  const isLoading = contextLoading || schoolsLoading

  if (isLoading) {
    return <SchoolsPageSkeleton />
  }

  if (!schools || schools.length === 0) {
    return <EmptySchoolsState />
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t('nav.ecole', 'École')}</h1>
        <p className="text-sm text-muted-foreground">
          {schools.length === 1 
            ? 'Votre établissement scolaire' 
            : `${schools.length} établissements scolaires`}
        </p>
      </div>

      <div className="space-y-3">
        {schools.map(school => (
          <SchoolCard key={school.id} school={school} />
        ))}
      </div>
    </div>
  )
}

interface SchoolCardProps {
  school: {
    id: string
    name: string
    code: string | null
    address: string | null
    phone: string | null
    email: string | null
    logoUrl: string | null
  }
}

const SchoolCard = memo(({ school }: SchoolCardProps) => {
  const initials = school.name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()

  const cityFromAddress = school.address?.split(',').pop()?.trim() || school.address

  return (
    <Link
      to="/app/schools/$schoolId/classes"
      params={{ schoolId: school.id }}
      className="block"
    >
      <Card className="group overflow-hidden border-2 transition-all hover:border-primary hover:shadow-md active:scale-[0.98]">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 shrink-0 rounded-xl border-2 border-muted">
              <AvatarImage 
                src={school.logoUrl ?? undefined} 
                alt={school.name}
                className="object-cover"
              />
              <AvatarFallback className="rounded-xl bg-primary/10 text-lg font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="space-y-0.5">
                <h2 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {school.name}
                </h2>
                {school.code && (
                  <p className="text-xs font-medium text-muted-foreground">
                    Code: {school.code}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                {cityFromAddress && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconMapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{cityFromAddress}</span>
                  </div>
                )}
                {school.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconPhone className="h-3.5 w-3.5 shrink-0" />
                    <span>{school.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <IconChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

SchoolCard.displayName = 'SchoolCard'

function EmptySchoolsState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="rounded-full bg-muted p-6">
        <IconBuilding className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Aucun établissement</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Vous n'êtes actuellement rattaché à aucun établissement scolaire.
        </p>
      </div>
    </div>
  )
}

function SchoolsPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-3">
        {[1, 2].map(i => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-24" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
