import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconPlus,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Progress } from '@workspace/ui/components/progress'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { getClassSubjects } from '@/school/functions/class-subjects'
import { getActiveSchoolYear } from '@/school/functions/school-years'
import { getTeachers } from '@/school/functions/teachers'

const MAX_HOURS_PER_WEEK = 30

function WorkloadSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={`skeleton-${i}`}>
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
  const t = useTranslations()
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <IconUsers className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.workload.emptyTitle()}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {t.workload.emptyDescription()}
            </p>
          </div>
          <Button
            render={(
              <Link to="/users/teachers" search={{ page: 1 }}>
                <IconPlus className="mr-2 h-4 w-4" />
                {t.teachers.add()}
              </Link>
            )}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export function TeacherWorkload() {
  const t = useTranslations()
  const { data: schoolYear, isLoading: schoolYearLoading } = useQuery({
    queryKey: ['activeSchoolYear'],
    queryFn: () => getActiveSchoolYear(),
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
  const teacherWorkloads = teachers.map((teacher) => {
    const assignments
      = classSubjectsData?.filter(cs => cs.teacher?.id === teacher.id) || []
    const totalHours = assignments.reduce(
      (sum: number, cs) => sum + (cs.classSubject.hoursPerWeek || 0),
      0,
    )
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
    <div
      className="space-y-6"
      role="region"
      aria-label={t.workload.ariaLabel()}
    >
      {overloadedTeachers.length > 0 && (
        <Alert variant="destructive" role="alert">
          <IconAlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t.workload.overloadDetected()}</AlertTitle>
          <AlertDescription>
            {overloadedTeachers.length}
            {' '}
            {t.workload.teachersExceedingMax({ maxHours: MAX_HOURS_PER_WEEK })}
          </AlertDescription>
        </Alert>
      )}

      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label={t.teachers.list()}
      >
        {teacherWorkloads.map(
          ({ teacher, totalHours, classCount, isOverloaded }, index) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'border-border/40 bg-card/40 backdrop-blur-xl transition-all hover:bg-card/60',
                  isOverloaded && 'border-destructive/50',
                )}
                role="listitem"
                aria-label={`${teacher.user.name} - ${totalHours}h/${t.common.week()} - ${isOverloaded ? t.workload.overloaded() : 'OK'}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <IconUser className="h-4 w-4" aria-hidden="true" />
                      {teacher.user.name}
                    </span>
                    {isOverloaded
                      ? (
                          <Badge
                            variant="destructive"
                            className="bg-destructive/10 text-destructive border-0"
                          >
                            <IconAlertTriangle
                              className="h-3 w-3 mr-1"
                              aria-hidden="true"
                            />
                            {t.workload.overloaded()}
                          </Badge>
                        )
                      : totalHours > 0
                        ? (
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary border-0"
                            >
                              <IconCircleCheck
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              OK
                            </Badge>
                          )
                        : (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground border-border/40"
                            >
                              {t.workload.notAssigned()}
                            </Badge>
                          )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <IconClock className="h-4 w-4" aria-hidden="true" />
                      {t.workload.hoursPerWeek()}
                    </span>
                    <span
                      className={`font-medium ${isOverloaded ? 'text-destructive' : ''}`}
                    >
                      {totalHours}
                      h /
                      {MAX_HOURS_PER_WEEK}
                      h
                    </span>
                  </div>
                  <Progress
                    value={(totalHours / MAX_HOURS_PER_WEEK) * 100}
                    className={cn(
                      'h-1.5 bg-white/5 shadow-inner',
                      isOverloaded && '[&>div]:bg-destructive',
                    )}
                    aria-label={`${t.workload.load()}: ${totalHours} ${t.common.hours()} ${t.common.on()} ${MAX_HOURS_PER_WEEK} ${t.common.maximum()}`}
                  />
                  <div className="text-xs text-muted-foreground">
                    {classCount}
                    {' '}
                    {t.workload.classesAssigned()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ),
        )}
      </div>
    </div>
  )
}
