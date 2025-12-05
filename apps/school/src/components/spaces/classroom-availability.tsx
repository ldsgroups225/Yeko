import { useQuery } from '@tanstack/react-query'
import { Building2, CheckCircle, Plus, Users, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { getClassrooms } from '@/school/functions/classrooms'

function AvailabilitySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-8 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-2 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Aucune salle de classe</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Commencez par créer des salles de classe pour gérer leur disponibilité et les assigner aux classes.
            </p>
          </div>
          <Button asChild className="mt-2">
            <a href="/app/spaces/classrooms">
              <Plus className="mr-2 h-4 w-4" />
              Créer une salle
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ClassroomAvailability() {
  const { data: classrooms, isLoading } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => getClassrooms({ data: {} }),
  })

  if (isLoading) {
    return <AvailabilitySkeleton />
  }

  const classroomList = classrooms || []

  if (classroomList.length === 0) {
    return <EmptyState />
  }

  const availableCount = classroomList.filter((c: any) => c.assignedClassesCount === 0 && c.classroom.status === 'active').length
  const occupiedCount = classroomList.filter((c: any) => c.assignedClassesCount > 0).length
  const maintenanceCount = classroomList.filter((c: any) => c.classroom.status === 'maintenance').length
  const inactiveCount = classroomList.filter((c: any) => c.classroom.status === 'inactive').length

  return (
    <div className="space-y-6" role="region" aria-label="Disponibilité des salles de classe">
      <div className="grid gap-4 md:grid-cols-4" role="list" aria-label="Statistiques des salles">
        <Card role="listitem">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
              <span className="text-2xl font-bold" aria-label={`${availableCount} salles disponibles`}>
                {availableCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card role="listitem">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" aria-hidden="true" />
              <span className="text-2xl font-bold" aria-label={`${occupiedCount} salles occupées`}>
                {occupiedCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card role="listitem">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-yellow-500" aria-hidden="true" />
              <span className="text-2xl font-bold" aria-label={`${maintenanceCount} salles en maintenance`}>
                {maintenanceCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card role="listitem">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-500" aria-hidden="true" />
              <span className="text-2xl font-bold" aria-label={`${inactiveCount} salles inactives`}>
                {inactiveCount}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail des salles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" role="list" aria-label="Liste des salles de classe">
            {classroomList.map((item: any) => {
              const isAvailable = item.assignedClassesCount === 0 && item.classroom.status === 'active'
              const occupancyPercent = item.classroom.capacity > 0
                ? Math.min(100, (item.assignedClassesCount / 1) * 100)
                : 0

              return (
                <div
                  key={item.classroom.id}
                  className="flex items-center gap-4"
                  role="listitem"
                  aria-label={`${item.classroom.name} - ${isAvailable ? 'Disponible' : item.classroom.status !== 'active' ? item.classroom.status : `${item.assignedClassesCount} classe(s) assignée(s)`}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{item.classroom.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.classroom.code}
                      </Badge>
                      {item.classroom.status === 'maintenance' && (
                        <Badge variant="secondary" className="text-xs">Maintenance</Badge>
                      )}
                      {item.classroom.status === 'inactive' && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Capacité:
                      {' '}
                      {item.classroom.capacity}
                      {' '}
                      • Type:
                      {' '}
                      {item.classroom.type}
                    </div>
                  </div>
                  <div className="w-32">
                    <Progress
                      value={occupancyPercent}
                      className="h-2"
                      aria-label={`Taux d'occupation: ${occupancyPercent}%`}
                    />
                  </div>
                  <div className="w-24 text-right">
                    {isAvailable
                      ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Disponible
                          </Badge>
                        )
                      : item.classroom.status !== 'active'
                        ? (
                            <Badge variant="secondary">
                              {item.classroom.status === 'maintenance' ? 'Maintenance' : 'Inactive'}
                            </Badge>
                          )
                        : (
                            <Badge variant="default">
                              {item.assignedClassesCount}
                              {' '}
                              classe(s)
                            </Badge>
                          )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
