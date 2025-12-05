import { useQuery } from '@tanstack/react-query'
import { Building2, CheckCircle, Users, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getClassrooms } from '@/school/functions/classrooms'

export function ClassroomAvailability() {
  const { data: classrooms, isLoading } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => getClassrooms({ data: {} }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const classroomList = classrooms || []
  const availableCount = classroomList.filter((c: any) => c.assignedClassesCount === 0 && c.classroom.status === 'active').length
  const occupiedCount = classroomList.filter((c: any) => c.assignedClassesCount > 0).length
  const maintenanceCount = classroomList.filter((c: any) => c.classroom.status === 'maintenance').length
  const inactiveCount = classroomList.filter((c: any) => c.classroom.status === 'inactive').length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{availableCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{occupiedCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{maintenanceCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold">{inactiveCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail des salles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classroomList.map((item: any) => {
              const isAvailable = item.assignedClassesCount === 0 && item.classroom.status === 'active'
              const occupancyPercent = item.classroom.capacity > 0
                ? Math.min(100, (item.assignedClassesCount / 1) * 100)
                : 0

              return (
                <div key={item.classroom.id} className="flex items-center gap-4">
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
                    <Progress value={occupancyPercent} className="h-2" />
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

      {classroomList.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Aucune salle de classe trouvée.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
