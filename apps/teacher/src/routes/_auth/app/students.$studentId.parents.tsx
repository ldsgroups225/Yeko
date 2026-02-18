import { IconMail, IconMessage, IconPhone, IconUser } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useI18nContext } from '@/i18n/i18n-react'
import { getStudentParentsFn } from '@/teacher/functions/parents'

export const Route = createFileRoute('/_auth/app/students/$studentId/parents')({
  component: StudentParentsPage,
})

function StudentParentsPage() {
  const { studentId } = Route.useParams()
  const { LL } = useI18nContext()

  const { data, isPending } = useQuery({
    queryKey: ['student-parents', studentId],
    queryFn: async () => getStudentParentsFn({ data: { studentId } }),
    enabled: !!studentId,
  })

  if (isPending) {
    return <ParentsSkeleton />
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">{LL.parents.title()}</h1>

      {data && data.length > 0
        ? (
            <div className="space-y-4">
              {data.map(({ parent, relationship, isPrimary }) => (
                <ParentCard
                  key={parent.id}
                  parent={{
                    ...parent,
                    relationship: relationship ?? '',
                    isPrimary: isPrimary ?? false,
                    preferredContact: null,
                    isVerified: false,
                    phone: parent.phone ?? null,
                    email: parent.email ?? null,
                  }}
                />
              ))}
            </div>
          )
        : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <IconUser className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {LL.parents.noParents()}
                </p>
              </CardContent>
            </Card>
          )}
    </div>
  )
}

interface Parent {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  email: string | null
  relationship: string
  isPrimary: boolean
  preferredContact: string | null
  isVerified: boolean
}

function ParentCard({ parent }: { parent: Parent }) {
  const { LL } = useI18nContext()

  const getRelationshipLabel = (rel: string) => {
    const labels: Record<string, string> = {
      father: LL.parents.father(),
      mother: LL.parents.mother(),
      guardian: LL.parents.guardian(),
      other: LL.parents.other(),
    }
    return labels[rel] || rel
  }

  const getPreferredContactLabel = (pref: string | null) => {
    if (!pref)
      return null
    const labels: Record<string, string> = {
      phone: LL.parents.contactPhone(),
      email: LL.parents.contactEmail(),
    }
    return labels[pref] || pref
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {parent.firstName}
            {' '}
            {parent.lastName}
          </CardTitle>
          <div className="flex gap-2">
            {parent.isPrimary && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {LL.parents.primary()}
              </span>
            )}
            {parent.isVerified && (
              <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                {LL.parents.verified()}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {getRelationshipLabel(parent.relationship)}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {parent.phone && (
          <div className="flex items-center gap-3">
            <IconPhone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${parent.phone}`} className="text-sm hover:underline">
              {parent.phone}
            </a>
          </div>
        )}
        {parent.email && (
          <div className="flex items-center gap-3">
            <IconMail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${parent.email}`} className="text-sm hover:underline">
              {parent.email}
            </a>
          </div>
        )}
        {parent.preferredContact && (
          <p className="text-xs text-muted-foreground">
            {LL.parents.prefers()}
            :
            {getPreferredContactLabel(parent.preferredContact)}
          </p>
        )}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline">
            <IconMessage className="mr-2 h-4 w-4" />
            {LL.parents.sendMessage()}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ParentsSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <Skeleton className="h-7 w-40" />
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-9 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
