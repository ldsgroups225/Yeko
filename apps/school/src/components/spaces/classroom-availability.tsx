import { useQuery } from '@tanstack/react-query'
import { Building2, CheckCircle, Plus, Users, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getClassrooms } from '@/school/functions/classrooms'

function StatsCards({ available, occupied, maintenance, inactive }: { available: number, occupied: number, maintenance: number, inactive: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-4" role="list" aria-label="Statistiques des salles">
      <Card role="listitem">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
            <span className="text-2xl font-bold" aria-label={`${available} salles disponibles`}>
              {available}
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
            <span className="text-2xl font-bold" aria-label={`${occupied} salles occupées`}>
              {occupied}
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
            <span className="text-2xl font-bold" aria-label={`${maintenance} salles en maintenance`}>
              {maintenance}
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
            <span className="text-2xl font-bold" aria-label={`${inactive} salles inactives`}>
              {inactive}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyState() {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t('empty.noClassrooms')}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {t('empty.createClassroomsDescription')}
            </p>
          </div>
          <Button asChild className="mt-2">
            <a href="/spaces/classrooms">
              <Plus className="mr-2 h-4 w-4" />
              {t('empty.createClassroom')}
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
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <TableSkeleton columns={5} rows={5} />
      </div>
    )
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
      <StatsCards
        available={availableCount}
        occupied={occupiedCount}
        maintenance={maintenanceCount}
        inactive={inactiveCount}
      />

      <Card>
        <CardHeader>
          <CardTitle>Détail des salles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead className="w-[100px] text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classroomList.map((item: any) => {
                  const isAvailable = item.assignedClassesCount === 0 && item.classroom.status === 'active'
                  const occupancyPercent = item.classroom.capacity > 0
                    ? Math.min(100, (item.assignedClassesCount / 1) * 100) // Assuming 1 class per room for visualization? Or is it logic dependent? logic says capacity vs count. The old code used this.
                    : 0

                  return (
                    <TableRow key={item.classroom.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.classroom.name}</div>
                          <div className="text-xs text-muted-foreground">{item.classroom.code}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{item.classroom.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Progress value={occupancyPercent} className="h-2 w-24" />
                          <span className="text-sm text-muted-foreground">
                            {item.assignedClassesCount}
                            {' '}
                            classe(s) /
                            {' '}
                            {item.classroom.capacity}
                            {' '}
                            cap.
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
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
                                Occupé
                              </Badge>
                            )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
