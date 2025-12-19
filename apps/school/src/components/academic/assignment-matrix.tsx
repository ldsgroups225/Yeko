import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Plus, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { assignTeacherToClassSubject, getAssignmentMatrix, removeTeacherFromClassSubject } from '@/school/functions/class-subjects'
import { getActiveSchoolYear } from '@/school/functions/school-years'
import { getAllSubjects } from '@/school/functions/subjects'

import { getTeachers } from '@/school/functions/teachers'

interface AssignmentMatrixProps {
  schoolYearId?: string
}

function MatrixSkeleton() {
  return (
    <Card>
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
                <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-10 w-36" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t('assignmentMatrix.emptyTitle')}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {t('assignmentMatrix.emptyDescription')}
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" asChild>
              <a href="/classes">
                <Plus className="mr-2 h-4 w-4" />
                {t('classes.create')}
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/settings/subjects">
                <Settings className="mr-2 h-4 w-4" />
                {t('subjects.configure')}
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AssignmentMatrix({ schoolYearId: propSchoolYearId }: AssignmentMatrixProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editingCell, setEditingCell] = useState<{ classId: string, subjectId: string } | null>(null)

  const { data: schoolYear } = useQuery({
    queryKey: ['activeSchoolYear'],
    queryFn: () => getActiveSchoolYear(),
    enabled: !propSchoolYearId,
  })

  const effectiveSchoolYearId = propSchoolYearId || schoolYear?.id

  const { data: matrixData, isLoading: matrixLoading } = useQuery({
    queryKey: ['assignmentMatrix', effectiveSchoolYearId],
    queryFn: () => getAssignmentMatrix({ data: effectiveSchoolYearId! }),
    enabled: !!effectiveSchoolYearId,
  })

  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ data: {} }),
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => getAllSubjects({ data: {} }),
  })

  const assignMutation = useMutation({
    mutationFn: (data: { classId: string, subjectId: string, teacherId: string }) =>
      assignTeacherToClassSubject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentMatrix'] })
      toast.success(t('assignmentMatrix.assignedSuccess'))
      setEditingCell(null)
    },
    onError: (error: Error) => {
      if (error.message.includes('not qualified')) {
        toast.error(t('assignmentMatrix.errorNotQualified'))
      }
      else if (error.message.includes('permission')) {
        toast.error(t('common.errorPermission'))
      }
      else {
        toast.error(error.message || t('common.error'))
      }
    },
  })

  const removeMutation = useMutation({
    mutationFn: (data: { classId: string, subjectId: string }) =>
      removeTeacherFromClassSubject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentMatrix'] })
      toast.success(t('assignmentMatrix.removedSuccess'))
    },
    onError: (error: Error) => {
      if (error.message.includes('permission')) {
        toast.error(t('common.errorPermission'))
      }
      else {
        toast.error(error.message || t('common.error'))
      }
    },
  })

  // Calculate teacher workload for overload warnings
  const teacherWorkload = new Map<string, number>()
  matrixData?.forEach((item: any) => {
    if (item.teacherId && item.hoursPerWeek) {
      const current = teacherWorkload.get(item.teacherId) || 0
      teacherWorkload.set(item.teacherId, current + item.hoursPerWeek)
    }
  })

  const isTeacherOverloaded = (teacherId: string) => {
    return (teacherWorkload.get(teacherId) || 0) > 30
  }

  if (matrixLoading) {
    return <MatrixSkeleton />
  }

  if (!matrixData || matrixData.length === 0) {
    return <EmptyState />
  }

  // Build matrix structure
  const classes = [...new Map(matrixData.map((item: any) => [item.classId, { id: item.classId, name: item.className }])).values()]
  const subjects = subjectsData?.subjects || []

  // Create assignment lookup
  const assignmentMap = new Map<string, { teacherId: string | null, teacherName: string | null }>()
  matrixData.forEach((item: any) => {
    if (item.subjectId) {
      assignmentMap.set(`${item.classId}-${item.subjectId}`, {
        teacherId: item.teacherId,
        teacherName: item.teacherName,
      })
    }
  })

  const teachers = teachersData?.teachers || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('assignmentMatrix.title')}</span>
          <Badge variant="outline">
            {classes.length}
            {' '}
            {t('common.classes')}
            {' '}
            ×
            {' '}
            {subjects.length}
            {' '}
            {t('common.subjects')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" role="region" aria-label={t('assignmentMatrix.ariaLabel')}>
          <Table aria-label={t('assignmentMatrix.ariaLabel')}>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 min-w-[120px]" scope="col">
                  {t('common.class')}
                </TableHead>
                {subjects.map((subject: any) => (
                  <TableHead key={subject.id} className="text-center min-w-[150px]" scope="col">
                    {subject.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls: any) => (
                <TableRow key={cls.id}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium" scope="row">
                    {cls.name}
                  </TableCell>
                  {subjects.map((subject: any) => {
                    const key = `${cls.id}-${subject.id}`
                    const assignment = assignmentMap.get(key)
                    const isEditing = editingCell?.classId === cls.id && editingCell?.subjectId === subject.id
                    const teacherOverloaded = assignment?.teacherId ? isTeacherOverloaded(assignment.teacherId) : false

                    return (
                      <TableCell key={key} className="text-center p-1">
                        {isEditing
                          ? (
                              <div className="flex items-center gap-1">
                                <Select
                                  onValueChange={(teacherId) => {
                                    if (teacherId === 'none') {
                                      removeMutation.mutate({ classId: cls.id, subjectId: subject.id })
                                    }
                                    else {
                                      assignMutation.mutate({ classId: cls.id, subjectId: subject.id, teacherId })
                                    }
                                  }}
                                  defaultValue={assignment?.teacherId || 'none'}
                                >
                                  <SelectTrigger
                                    className="h-8 w-[140px]"
                                    aria-label={`${t('assignmentMatrix.selectTeacherFor')} ${cls.name} - ${subject.name}`}
                                  >
                                    <SelectValue placeholder={t('common.select')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">{t('assignmentMatrix.notAssigned')}</SelectItem>
                                    {teachers.map((teacher: any) => {
                                      const overloaded = isTeacherOverloaded(teacher.id)
                                      return (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                          <span className="flex items-center gap-2">
                                            {teacher.user.name}
                                            {overloaded && (
                                              <AlertTriangle className="h-3 w-3 text-destructive" aria-label={t('assignmentMatrix.teacherOverloaded')} />
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
                                  className="h-8 w-8"
                                  onClick={() => setEditingCell(null)}
                                  aria-label={t('common.cancel')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={assignment?.teacherId ? 'secondary' : 'ghost'}
                                      size="sm"
                                      className={`h-8 w-full ${!assignment?.teacherId ? 'text-muted-foreground border-dashed border' : ''}`}
                                      onClick={() => setEditingCell({ classId: cls.id, subjectId: subject.id })}
                                      aria-label={
                                        assignment?.teacherId
                                          ? `${assignment.teacherName} ${t('assignmentMatrix.teaches')} ${subject.name} ${t('common.in')} ${cls.name}. ${t('common.clickToEdit')}`
                                          : `${t('assignmentMatrix.assignTeacherFor')} ${subject.name} ${t('common.in')} ${cls.name}`
                                      }
                                    >
                                      {assignment?.teacherId
                                        ? (
                                            <span className="flex items-center gap-1 truncate max-w-[120px]">
                                              {assignment.teacherName}
                                              {teacherOverloaded && (
                                                <AlertTriangle className="h-3 w-3 text-destructive shrink-0" aria-hidden="true" />
                                              )}
                                            </span>
                                          )
                                        : (
                                            <span aria-hidden="true">—</span>
                                          )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {assignment?.teacherId
                                      ? (
                                          <span>
                                            {assignment.teacherName}
                                            {teacherOverloaded && ` (${t('assignmentMatrix.overloaded')})`}
                                            {' '}
                                            -
                                            {' '}
                                            {t('common.clickToEdit')}
                                          </span>
                                        )
                                      : t('assignmentMatrix.clickToAssign')}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
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
  )
}
