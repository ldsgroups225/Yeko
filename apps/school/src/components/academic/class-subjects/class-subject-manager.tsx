import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Loader2, Plus, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
import { useTranslations } from '@/i18n'
import {
  classSubjectsKeys,
  classSubjectsOptions,
} from '@/lib/queries/class-subjects'
import { teacherOptions } from '@/lib/queries/teachers'
import {
  assignTeacherToClassSubject,
  removeClassSubject,
} from '@/school/functions/class-subjects'
import { ClassCoverageSummary } from './class-coverage-summary'
import { ClassSubjectDialog } from './class-subject-dialog'
import { SubjectCopyDialog } from './subject-copy-dialog'

interface ClassSubjectManagerProps {
  classId: string
  className: string
}

export function ClassSubjectManager({
  classId,
  className,
}: ClassSubjectManagerProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { data: subjects, isLoading } = useQuery(
    classSubjectsOptions.list({ classId }),
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState<{
    id: string
    name: string
  } | null>(null)
  const [pendingAssignment, setPendingAssignment] = useState<{
    subjectId: string
    subjectName: string
    teacherId: string
    teacherName: string
  } | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (data: { classId: string, subjectId: string }) =>
      removeClassSubject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: classSubjectsKeys.list({ classId }),
      })
      toast.success(t.academic.classes.removeSubjectSuccess())
      setSubjectToDelete(null)
    },
    onError: () => {
      toast.error(t.academic.classes.removeSubjectError())
    },
  })

  // Quick Teacher Assignment
  const { data: teachersData } = useQuery({
    ...teacherOptions.list({}, { page: 1, limit: 100 }),
  })

  const assignMutation = useMutation({
    mutationFn: (data: { subjectId: string, teacherId: string }) =>
      assignTeacherToClassSubject({
        data: { classId, subjectId: data.subjectId, teacherId: data.teacherId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: classSubjectsKeys.list({ classId }),
      })
      toast.success(t.academic.grades.assignment.success())
      setPendingAssignment(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t.common.error())
    },
  })

  const teachers = teachersData?.teachers || []

  // Group subjects by category for better display if needed, but for now simple list
  // The query returns subjects sorted by name

  return (
    <div className="space-y-6">
      {!isLoading && subjects && <ClassCoverageSummary subjects={subjects} />}

      <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{t.academic.classes.subjectsTitle()}</CardTitle>
            <CardDescription>
              {t.academic.classes.subjectsDescription()}
              {' '}
              {className}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCopyDialogOpen(true)}
              variant="outline"
              size="sm"
            >
              <Copy className="mr-2 h-4 w-4" />
              {t.academic.classes.copyFrom()}
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t.academic.classes.addSubject()}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.academic.classes.subject()}</TableHead>
                  <TableHead>{t.academic.classes.teacher()}</TableHead>
                  <TableHead className="text-center">
                    {t.academic.classes.coeff()}
                  </TableHead>
                  <TableHead className="text-center">
                    {t.academic.classes.hoursPerWeek()}
                  </TableHead>
                  <TableHead className="text-right">
                    {t.common.actions()}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? (
                    Array.from({ length: 3 }, (_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8 mx-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8 mx-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  )
                  : subjects?.length === 0
                    ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {t.academic.classes.noSubjects()}
                        </TableCell>
                      </TableRow>
                    )
                    : (
                      subjects?.map(item => (
                        <TableRow key={item.classSubject.id}>
                          <TableCell className="font-medium">
                            {item.subject.name}
                            <span className="text-xs text-muted-foreground ml-2">
                              (
                              {item.subject.shortName}
                              )
                            </span>
                          </TableCell>
                          <TableCell>
                            <Select
                              disabled={assignMutation.isPending}
                              value={item.teacher?.id || 'none'}
                              onValueChange={(val) => {
                                if (val !== 'none') {
                                  const teacher = teachers.find(t => t.id === val)
                                  if (teacher) {
                                    setPendingAssignment({
                                      subjectId: item.subject.id,
                                      subjectName: item.subject.name,
                                      teacherId: val,
                                      teacherName: teacher.user.name,
                                    })
                                  }
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 w-[180px] text-xs border-none bg-transparent hover:bg-white/5 focus:ring-0 px-0 shadow-none">
                                <div className="flex items-center gap-2">
                                  {assignMutation.isPending && assignMutation.variables?.subjectId === item.subject.id
                                    ? (
                                      <Loader2 className="size-3 animate-spin" />
                                    )
                                    : item.teacher?.name
                                      ? (
                                        <span className="font-medium">{item.teacher.name}</span>
                                      )
                                      : (
                                        <div className="flex items-center gap-2 text-muted-foreground italic">
                                          <UserPlus className="size-3" />
                                          <span>{t.academic.classes.unassigned()}</span>
                                        </div>
                                      )}
                                </div>
                              </SelectTrigger>
                              <SelectContent className="backdrop-blur-xl bg-card/95 border-border/40">
                                <SelectItem value="none" disabled className="text-xs italic opacity-50">
                                  {t.academic.classes.unassigned()}
                                </SelectItem>
                                {teachers.map(teacher => (
                                  <SelectItem
                                    key={teacher.id}
                                    value={teacher.id}
                                    className="text-xs font-medium focus:bg-primary/5 focus:text-primary"
                                  >
                                    {teacher.user.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {item.classSubject.coefficient}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm">
                              {item.classSubject.hoursPerWeek}
                              h
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSubjectToDelete({
                                  id: item.subject.id,
                                  name: item.subject.name,
                                })
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <ClassSubjectDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          classId={classId}
          className={className}
        />

        <SubjectCopyDialog
          open={isCopyDialogOpen}
          onOpenChange={setIsCopyDialogOpen}
          targetClassId={classId}
          targetClassName={className}
        />

        <DeleteConfirmationDialog
          open={!!subjectToDelete}
          onOpenChange={open => !open && setSubjectToDelete(null)}
          title={t.classes.removeSubject()}
          description={t.academic.classes.removeSubjectConfirmation({
            subjectName: subjectToDelete?.name,
          })}
          onConfirm={() => {
            if (subjectToDelete) {
              deleteMutation.mutate({
                classId,
                subjectId: subjectToDelete.id,
              })
            }
          }}
          isLoading={deleteMutation.isPending}
        />

        <ConfirmationDialog
          open={!!pendingAssignment}
          onOpenChange={open => !open && setPendingAssignment(null)}
          title={t.dialogs.updateAssignment.title()}
          description={t.dialogs.updateAssignment.description({
            teacherName: pendingAssignment?.teacherName || '',
            subjectName: pendingAssignment?.subjectName || '',
          })}
          confirmLabel={t.dialogs.updateAssignment.confirm()}
          onConfirm={() => {
            if (pendingAssignment) {
              assignMutation.mutate({
                subjectId: pendingAssignment.subjectId,
                teacherId: pendingAssignment.teacherId,
              })
            }
          }}
          isLoading={assignMutation.isPending}
        />
      </Card>
    </div>
  )
}
