import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

export function AssignmentMatrixSkeleton() {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={`col-${i}`} className="h-10 w-36" />
            ))}
          </div>
          {Array.from({ length: 6 }, (_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              {Array.from({ length: 5 }, (_, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="h-10 w-36"
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
