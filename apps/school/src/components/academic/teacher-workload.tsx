import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle, Clock, Plus, User, Users } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { getClassSubjects } from '@/school/functions/class-subjects'
import { getActiveSchoolYear } from '@/school/functions/school-years'
import { getTeachers } from '@/school/functions/teachers'

const MAX_HOURS_PER_WEEK = 30

function WorkloadSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Aucun enseignant</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Ajoutez des enseignants pour suivre leur charge de travail et gérer les affectations.
            </p>
          </div>
          <Button asChild className="mt-2">
            <a href="/app/hr/teachers">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un enseignant
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function TeacherWorkload() {
  const { data: schoolYear, isLoading: schoolYearLoading } = useQuery({
    queryKey: ['activeSchoolYear'],
    queryFn: () => getActiveSchoolYear({ data: {} }),
  })

  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ data: {} }),
  })

  const { data: classSubjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['classSubjects', schoolYear?.id],
    queryFn: () => getClassSubjects({ data: { schoolYearId: schoolYear?.id } }),
    enabled: !!schoolYear?.id,
  })

  const isLoading = schoolYearLoading || teachersLoading || subjectsLoading

  if (isLoading) {
    return <WorkloadSkeleton />
  }

  const teachers = teachersData?.teachers || []

  if (teachers.length === 0) {
    return <EmptyState />
  }

  // Calculate workload per teacher
  const teacherWorkloads = teachers.map((teacher: any) => {
    const assignments = classSubjectsData?.filter((cs: any) => cs.teacher?.id === teacher.id) || []
    const totalHours = assignments.reduce((sum: number, cs: any) => sum + (cs.classSubject.hoursPerWeek || 0), 0)
    const classCount = assignments.length
    const isOverloaded = totalHours > MAX_HOURS_PER_WEEK

    return {
      teacher,
      totalHours,
      classCount,
      isOverloaded,
      assignments,
    }
  })

  const overloadedTeachers = teacherWorkloads.filter(tw => tw.isOverloaded)

  return (
    <div className="space-y-6" role="region" aria-label="Charge de travail des enseignants">
      {overloadedTeachers.length > 0 && (
        <Alert variant="destructive" role="alert">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Surcharge détectée</AlertTitle>
          <AlertDescription>
            {overloadedTeachers.length}
            {' '}
            enseignant(s) dépassent
            {' '}
            {MAX_HOURS_PER_WEEK}
            h/semaine.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Liste des enseignants">
        {teacherWorkloads.map(({ teacher, totalHours, classCount, isOverloaded }) => (
          <Card
            key={teacher.id}
            className={isOverloaded ? 'border-destructive' : ''}
            role="listitem"
            aria-label={`${teacher.user.name} - ${totalHours}h/semaine - ${isOverloaded ? 'Surchargé' : 'OK'}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" aria-hidden="true" />
                  {teacher.user.name}
                </span>
                {isOverloaded
                  ? (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                      Surchargé
                    </Badge>
                  )
                  : totalHours > 0
                    ? (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                        OK
                      </Badge>
                    )
                    : (
                      <Badge variant="outline">Non assigné</Badge>
                    )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  Heures/semaine
                </span>
                <span className={`font-medium ${isOverloaded ? 'text-destructive' : ''}`}>
                  {totalHours}
                  h /
                  {MAX_HOURS_PER_WEEK}
                  h
                </span>
              </div>
              <Progress
                value={(totalHours / MAX_HOURS_PER_WEEK) * 100}
                className={isOverloaded ? '[&>div]:bg-destructive' : ''}
                aria-label={`Charge: ${totalHours} heures sur ${MAX_HOURS_PER_WEEK} maximum`}
              />
              <div className="text-sm text-muted-foreground">
                {classCount}
                {' '}
                classe(s) assignée(s)
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
