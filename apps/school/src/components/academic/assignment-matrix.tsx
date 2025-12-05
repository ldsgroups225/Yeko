import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
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
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'assignation')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (data: { classId: string, subjectId: string }) =>
      removeTeacherFromClassSubject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentMatrix'] })
      toast.success('Assignation supprimée')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    },
  })

  if (matrixLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!matrixData || matrixData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Aucune donnée disponible pour la matrice d'affectation.</p>
        </CardContent>
      </Card>
    )
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 min-w-[120px]">Classe</TableHead>
                {subjects.map((subject: any) => (
                  <TableHead key={subject.id} className="text-center min-w-[150px]">
                    {subject.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls: any) => (
                <TableRow key={cls.id}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">
                    {cls.name}
                  </TableCell>
                  {subjects.map((subject: any) => {
                    const key = `${cls.id}-${subject.id}`
                    const assignment = assignmentMap.get(key)
                    const isEditing = editingCell?.classId === cls.id && editingCell?.subjectId === subject.id

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
                                  <SelectTrigger className="h-8 w-[140px]">
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Non assigné</SelectItem>
                                    {teachers.map((teacher: any) => (
                                      <SelectItem key={teacher.id} value={teacher.id}>
                                        {teacher.user.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingCell(null)}
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
                                    >
                                      {assignment?.teacherId
                                        ? (
                                            <span className="truncate max-w-[120px]">{assignment.teacherName}</span>
                                          )
                                        : (
                                            <span>—</span>
                                          )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {assignment?.teacherId
                                      ? `${assignment.teacherName} - Cliquer pour modifier`
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
