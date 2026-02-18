import { IconInbox, IconSchool } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useI18nContext } from '@/i18n/i18n-react'

export function EmptyStudents() {
  const { LL } = useI18nContext()
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <IconInbox className="h-10 w-10 text-muted-foreground/40" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{LL.class_details.noStudents()}</h3>
      <p className="text-muted-foreground mt-1 max-w-[250px]">
        {LL.class_details.noStudentsDescription()}
      </p>
    </div>
  )
}

export function ClassNotFound({ schoolId }: { schoolId: string }) {
  const { LL } = useI18nContext()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-6 rounded-full bg-destructive/10 p-4">
        <IconSchool className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold mb-2">{LL.class_details.notFound()}</h1>
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
        <div className="flex gap-2 pb-2 overflow-x-auto">
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
