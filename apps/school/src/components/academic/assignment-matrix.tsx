import {
  IconAlertTriangle,
  IconPlus,
  IconSchool,
  IconSettings,
  IconX,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { cn } from '@/lib/utils'
import {
  assignTeacherToClassSubject,
  getAssignmentMatrix,
  removeTeacherFromClassSubject,
} from '@/school/functions/class-subjects'
import { getActiveSchoolYear } from '@/school/functions/school-years'
import { getAllSubjects } from '@/school/functions/subjects'
import { getTeachers } from '@/school/functions/teachers'

interface AssignmentMatrixProps {
  schoolYearId?: string
}

function MatrixSkeleton() {
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

function EmptyState() {
  const t = useTranslations()
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <IconSettings className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {t.assignmentMatrix.emptyTitle()}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {t.assignmentMatrix.emptyDescription()}
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              render={(
                <Link to="/classes">
                  <IconPlus className="mr-2 h-4 w-4" />
                  {t.classes.create()}
                </Link>
              )}
            />
            <Button
              variant="outline"
              render={(
                <Link to="/programs/subjects">
                  <IconSettings className="mr-2 h-4 w-4" />
                  {t.subjects.configure()}
                </Link>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AssignmentMatrix({
  schoolYearId: propSchoolYearId,
}: AssignmentMatrixProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [editingCell, setEditingCell] = useState<{
    classId: string
    subjectId: string
  } | null>(null)

  const { data: schoolYearResult } = useQuery({
    queryKey: ['activeSchoolYear'],
    queryFn: () => getActiveSchoolYear(),
    enabled: !propSchoolYearId,
  })

  const activeSchoolYear = schoolYearResult?.success ? schoolYearResult.data : null
  const effectiveSchoolYearId = propSchoolYearId || activeSchoolYear?.id

  const { data: matrixResult, isLoading: matrixLoading } = useQuery({
    queryKey: ['assignmentMatrix', effectiveSchoolYearId],
    queryFn: () => getAssignmentMatrix({ data: effectiveSchoolYearId! }),
    enabled: !!effectiveSchoolYearId,
  })
  const matrixData = matrixResult?.success ? matrixResult.data : []

  const { data: teachersResult } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ data: {} }),
  })

  const { data: subjectsResult } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => getAllSubjects({ data: {} }),
  })

  const assignMutation = useMutation({
    mutationKey: schoolMutationKeys.classSubjects.assignTeacher,
    mutationFn: (data: {
      classId: string
      subjectId: string
      teacherId: string
    }) => assignTeacherToClassSubject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentMatrix'] })
      toast.success(t.assignmentMatrix.assignedSuccess())
      setEditingCell(null)
    },
    onError: (error: Error) => {
      if (error.message.includes('not qualified')) {
        toast.error(t.assignmentMatrix.errorNotQualified())
      }
      else if (error.message.includes('permission')) {
        toast.error(t.common.errorPermission())
      }
      else {
        toast.error(error.message || t.common.error())
      }
    },
  })

  const removeMutation = useMutation({
    mutationKey: schoolMutationKeys.teachers.unassign,
    mutationFn: (data: { classId: string, subjectId: string }) =>
      removeTeacherFromClassSubject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentMatrix'] })
      toast.success(t.assignmentMatrix.removedSuccess())
    },
    onError: (error: Error) => {
      if (error.message.includes('permission')) {
        toast.error(t.common.errorPermission())
      }
      else {
        toast.error(error.message || t.common.error())
      }
    },
  })

  // Calculate teacher workload for overload warnings
  const teacherWorkload = new Map<string, number>()
  if (Array.isArray(matrixData)) {
    matrixData.forEach((item) => {
      if (item.teacherId && item.hoursPerWeek) {
        const current = teacherWorkload.get(item.teacherId) || 0
        teacherWorkload.set(item.teacherId, current + item.hoursPerWeek)
      }
    })
  }

  const isTeacherOverloaded = (teacherId: string) => {
    return (teacherWorkload.get(teacherId) || 0) > 30
  }

  if (matrixLoading) {
    return <MatrixSkeleton />
  }

  if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
    return <EmptyState />
  }

  // Build matrix structure
  const classes = [
    ...new Map(
      matrixData.map((itemValue: { classId: string, className: string }) => [
        itemValue.classId,
        { id: itemValue.classId, name: itemValue.className },
      ]),
    ).values(),
  ]

  // Handle serializable Result or direct value
  const subjects = subjectsResult?.success ? (subjectsResult.data.subjects || []) : []

  // Create assignment lookup
  const assignmentMap = new Map<
    string,
    { teacherId: string | null, teacherName: string | null }
  >()
  matrixData.forEach((item: { classId: string, subjectId: string | null, teacherId: string | null, teacherName: string | null }) => {
    if (item.subjectId) {
      assignmentMap.set(`${item.classId}-${item.subjectId}`, {
        teacherId: item.teacherId,
        teacherName: item.teacherName,
      })
    }
  })

  const teachers = teachersResult?.success ? (teachersResult.data.teachers || []) : []

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <IconSchool className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{t.assignmentMatrix.title()}</CardTitle>
                <CardDescription>
                  {classes.length}
                  {' '}
                  {t.common.classes()}
                  {' '}
                  ×
                  {' '}
                  {subjects.length}
                  {' '}
                  {t.common.subjects()}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-border/40 bg-white/5">
              {matrixData.length}
              {' '}
              {t.common.total()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10"
            role="region"
            aria-label={t.assignmentMatrix.ariaLabel()}
          >
            <Table aria-label={t.assignmentMatrix.ariaLabel()}>
              <TableHeader>
                <TableRow className="border-border/10 hover:bg-transparent">
                  <TableHead
                    className="sticky left-0 bg-background/80 backdrop-blur-md z-20 min-w-[140px] border-r border-border/10"
                    scope="col"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                      {t.common.classes()}
                    </span>
                  </TableHead>
                  {subjects.map(subject => (
                    <TableHead
                      key={subject.id}
                      className="text-center min-w-[160px] border-b border-border/10 py-4"
                      scope="col"
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-foreground">
                          {subject.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {subject.shortName}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map(cls => (
                  <TableRow
                    key={cls.id}
                    className="border-border/5 hover:bg-white/5 transition-colors group"
                  >
                    <TableCell
                      className="sticky left-0 bg-card/60 backdrop-blur-md z-10 font-medium border-r border-border/10 py-4 group-hover:bg-primary/5 transition-colors"
                      scope="row"
                    >
                      {cls.name}
                    </TableCell>
                    {subjects.map((subject) => {
                      const key = `${cls.id}-${subject.id}`
                      const assignment = assignmentMap.get(key)
                      const isEditing
                        = editingCell?.classId === cls.id
                          && editingCell?.subjectId === subject.id
                      const teacherOverloaded = assignment?.teacherId
                        ? isTeacherOverloaded(assignment.teacherId)
                        : false

                      return (
                        <TableCell
                          key={key}
                          className="text-center p-2 relative"
                        >
                          <AnimatePresence mode="wait">
                            {isEditing
                              ? (
                                  <motion.div
                                    key="editing"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center gap-1 justify-center"
                                  >
                                    <Select
                                      onValueChange={(val) => {
                                        if (val === 'none') {
                                          removeMutation.mutate({
                                            classId: cls.id,
                                            subjectId: subject.id,
                                          })
                                        }
                                        else if (val) {
                                          assignMutation.mutate({
                                            classId: cls.id,
                                            subjectId: subject.id,
                                            teacherId: val,
                                          })
                                        }
                                      }}
                                      defaultValue={assignment?.teacherId || 'none'}
                                    >
                                      <SelectTrigger
                                        className="h-9 w-[150px] bg-white/5 border-white/10 text-xs focus:ring-primary/40"
                                        aria-label={`${t.assignmentMatrix.selectTeacherFor()} ${cls.name} - ${subject.name}`}
                                      >
                                        <SelectValue
                                          placeholder={t.common.select()}
                                        />
                                      </SelectTrigger>
                                      <SelectContent className="backdrop-blur-xl bg-card/95 border-white/10">
                                        <SelectItem
                                          value="none"
                                          className="text-xs"
                                        >
                                          {t.assignmentMatrix.notAssigned()}
                                        </SelectItem>
                                        {(teachers).map((teacher) => {
                                          const overloaded = isTeacherOverloaded(
                                            teacher.id,
                                          )
                                          return (
                                            <SelectItem
                                              key={teacher.id}
                                              value={teacher.id}
                                              className="text-xs"
                                            >
                                              <span className="flex items-center gap-2">
                                                {teacher.user.name}
                                                {overloaded && (
                                                  <Badge
                                                    variant="destructive"
                                                    className="h-4 px-1 text-[8px] bg-destructive/10 text-destructive border-0"
                                                  >
                                                    OVERLOAD
                                                  </Badge>
                                                )}
                                              </span>
                                            </SelectItem>
                                          )
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-white/10"
                                      onClick={() => setEditingCell(null)}
                                      aria-label={t.common.cancel()}
                                    >
                                      <IconX className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                )
                              : (
                                  <motion.div
                                    key={`static-${key}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                  >
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger
                                          render={(
                                            <Button
                                              variant={
                                                assignment?.teacherId
                                                  ? 'secondary'
                                                  : 'ghost'
                                              }
                                              size="sm"
                                              className={cn(
                                                'h-9 w-full min-w-[130px] rounded-lg transition-all border',
                                                assignment?.teacherId
                                                  ? 'bg-primary/5 hover:bg-primary/10 text-primary border-primary/20'
                                                  : 'text-muted-foreground border-dashed border-border/20 hover:border-primary/40 hover:bg-white/5',
                                              )}
                                              onClick={() =>
                                                setEditingCell({
                                                  classId: cls.id,
                                                  subjectId: subject.id,
                                                })}
                                            >
                                              {assignment?.teacherId
                                                ? (
                                                    <div className="flex items-center gap-1.5 truncate">
                                                      <span className="truncate">
                                                        {assignment.teacherName}
                                                      </span>
                                                      {teacherOverloaded && (
                                                        <IconAlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 animate-pulse" />
                                                      )}
                                                    </div>
                                                  )
                                                : (
                                                    <IconPlus className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                  )}
                                            </Button>
                                          )}
                                        />
                                        <TooltipContent className="backdrop-blur-xl bg-card/95 border-white/10 text-[11px]">
                                          {assignment?.teacherId
                                            ? (
                                                <div className="space-y-1">
                                                  <p className="font-semibold">
                                                    {assignment.teacherName}
                                                  </p>
                                                  {teacherOverloaded && (
                                                    <p className="text-amber-500 flex items-center gap-1">
                                                      <IconAlertTriangle className="h-3 w-3" />
                                                      {t.assignmentMatrix.overloaded()}
                                                    </p>
                                                  )}
                                                  <p className="opacity-70">
                                                    {t.common.clickToEdit()}
                                                  </p>
                                                </div>
                                              )
                                            : (
                                                t.assignmentMatrix.clickToAssign()
                                              )}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </motion.div>
                                )}
                          </AnimatePresence>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
