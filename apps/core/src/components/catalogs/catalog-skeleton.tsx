import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { generateUUID } from '@/utils/generateUUID'

export function CatalogListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map(() => (
        <div
          key={generateUUID()}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex flex-1 items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-sm" />
            <Skeleton className="h-8 w-8 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CatalogStatsSkeleton() {
  return (
    <div className="
      grid gap-4
      md:grid-cols-3
    "
    >
      {Array.from({ length: 3 }).map(() => (
        <Card key={generateUUID()}>
          <CardHeader className="
            flex flex-row items-center justify-between space-y-0 pb-2
          "
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-sm" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
