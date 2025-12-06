import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Plus, Settings, X } from 'lucide-react'
import { useState } from 'react'
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
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Aucune donnée disponible</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Créez d'abord des classes et configurez les matières pour commencer les affectations enseignants.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" asChild>
              <a href="/app/academic/classes">
                <Plus className="mr-2 h-4 w-4" />
                Créer une classe
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/app/settings/subjects">
                <Settings className="mr-2 h-4 w-4" />
                Configurer les matières
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AssignmentMatrix({ schoolYearId: propSchoolYearId }: AssignmentMatrixProps) {
  const queryClient = useQueryClient()
  const [editingCell, setEditingCell] = useState<{ classId: string, subjectId: string } | null>(null)

  const { data: schoolYear } = useQuery({
    queryKey: ['activeSchoolYear'],
    queryFn: () => getActiveSchoolYear({ data: {} }),
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
      toast.success('Enseignant assigné')
      setEditingCell(null)
    },
    onError: (error: Error) => {
      if (error.message.includes('not qualified')) {
        toast.error('Cet enseignant n\'est pas qualifié pour cette matière')
      }
      else if (error.message.includes('permission')) {
        toast.error('Vous n\'avez pas la permission d\'effectuer cette action')
      }
      else {
        toast.error(error.message || 'Erreur lors de l\'assignation')
      }
    },
  })

  const removeMutation = useMutation({
    mutationFn: (data: { classId: string, subjectId: string }) =>
      removeTeacherFromClassSubject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentMatrix'] })
      toast.success('Assignation supprimée')
    },
    onError: (error: Error) => {
      if (error.message.includes('permission')) {
        toast.error('Vous n\'avez pas la permission d\'effectuer cette action')
      }
      else {
        toast.error(error.message || 'Erreur lors de la suppression')
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
          <span>Matrice d'affectation</span>
          <Badge variant="outline">
            {classes.length}
            {' '}
            classes ×
            {' '}
            {subjects.length}
            {' '}
            matières
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" role="region" aria-label="Matrice d'affectation enseignants">
          <Table aria-label="Matrice d'affectation enseignants">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 min-w-[120px]" scope="col">
                  Classe
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
                                    aria-label={`Sélectionner enseignant pour ${cls.name} - ${subject.name}`}
                                  >
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Non assigné</SelectItem>
                                    {teachers.map((teacher: any) => {
                                      const overloaded = isTeacherOverloaded(teacher.id)
                                      return (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                          <span className="flex items-center gap-2">
                                            {teacher.user.name}
                                            {overloaded && (
                                              <AlertTriangle className="h-3 w-3 text-destructive" aria-label="Enseignant surchargé" />
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
                                  aria-label="Annuler la modification"
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
                                          ? `${assignment.teacherName} enseigne ${subject.name} en ${cls.name}. Cliquer pour modifier`
                                          : `Assigner un enseignant pour ${subject.name} en ${cls.name}`
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
                                            {teacherOverloaded && ' (Surchargé)'}
                                            {' '}
                                            - Cliquer pour modifier
                                          </span>
                                        )
                                      : 'Cliquer pour assigner un enseignant'}
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
