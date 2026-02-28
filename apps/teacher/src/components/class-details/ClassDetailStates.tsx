import { IconInbox, IconSchool } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useI18nContext } from '@/i18n/i18n-react'

export function EmptyStudents() {
  const { LL } = useI18nContext()
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-muted mb-4 rounded-full p-4">
        <IconInbox className="text-muted-foreground/40 h-10 w-10" />
      </div>
      <h3 className="text-foreground text-lg font-semibold">{LL.class_details.noStudents()}</h3>
      <p className="text-muted-foreground mt-1 max-w-[250px]">
        {LL.class_details.noStudentsDescription()}
      </p>
    </div>
  )
}

export function ClassNotFound({ schoolId }: { schoolId: string }) {
  const { LL } = useI18nContext()
  return (
    <div className="
      flex min-h-[60vh] flex-col items-center justify-center px-4 text-center
    "
    >
      <div className="bg-destructive/10 mb-6 rounded-full p-4">
        <IconSchool className="text-destructive h-12 w-12" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">{LL.class_details.notFound()}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        {LL.class_details.notFoundDescription()}
      </p>
      <Link to="/app/schools/$schoolId/classes" params={{ schoolId }}>
        <Button variant="default" className="rounded-xl px-8">
          {LL.nav.backToClasses()}
        </Button>
      </Link>
    </div>
  )
}

export function ClassDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>

      {/* List Header Skeleton */}
      <div className="flex items-center justify-between pt-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* List Items Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
