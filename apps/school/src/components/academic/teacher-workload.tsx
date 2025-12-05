import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle, Clock, User } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getClassSubjects } from '@/school/functions/class-subjects'
import { getActiveSchoolYear } from '@/school/functions/school-years'
import { getTeachers } from '@/school/functions/teachers'

const MAX_HOURS_PER_WEEK = 30

export function TeacherWorkload() {
  const { data: schoolYear } = useQuery({
    queryKey: ['activeSchoolYear'],
    queryFn: () => getActiveSchoolYear({ data: {} }),
  })

  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ data: {} }),
  })

  const { data: classSubjectsData } = useQuery({
    queryKey: ['classSubjects', schoolYear?.id],
    queryFn: () => getClassSubjects({ data: { schoolYearId: schoolYear?.id } }),
    enabled: !!schoolYear?.id,
  })

  const teachers = teachersData?.teachers || []

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
    <div className="space-y-6">
      {overloadedTeachers.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Surcharge détectée</AlertTitle>
          <AlertDescription>
            {overloadedTeachers.length}
            {' '}
            enseignant(s) dépassent
            {MAX_HOURS_PER_WEEK}
            h/semaine.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teacherWorkloads.map(({ teacher, totalHours, classCount, isOverloaded }) => (
          <Card key={teacher.id} className={isOverloaded ? 'border-destructive' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {teacher.user.name}
                </span>
                {isOverloaded
                  ? (
                    <Badge variant="destructive">Surchargé</Badge>
                  )
                  : totalHours > 0
                    ? (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
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
                  <Clock className="h-4 w-4" />
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

      {teachers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Aucun enseignant trouvé.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
