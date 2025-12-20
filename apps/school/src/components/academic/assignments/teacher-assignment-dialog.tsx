import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import {
  teacherSubjectsKeys,
  teacherSubjectsOptions,
} from '@/lib/queries/teacher-subjects'
import { saveTeacherAssignments } from '@/school/functions/teacher-subjects'

interface TeacherAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacherId: string
  teacherName: string
}

export function TeacherAssignmentDialog({
  open,
  onOpenChange,
  teacherId,
  teacherName,
}: TeacherAssignmentDialogProps) {
  const t = useTranslations()
  const { schoolYearId } = useSchoolYearContext()
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>())
  const queryClient = useQueryClient()

  // Fetch available subjects (not yet assigned)
  const { data: availableSubjects, isLoading } = useQuery({
    ...teacherSubjectsOptions.available(teacherId ?? undefined, schoolYearId ?? undefined),
    enabled: open && !!schoolYearId,
  })

  // Mutation to save assignments
  const assignMutation = useMutation({
    mutationFn: (subjectIds: string[]) =>
      saveTeacherAssignments({
        data: {
          teacherId,
          subjectIds,
        },
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: teacherSubjectsKeys.all })
      toast.success(
        t.academic.assignments.assignSuccess({
          count: result.length,
          teacherName,
        }),
      )
      setSelectedIds(new Set())
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t.academic.assignments.assignError())
    },
  })

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    }
    else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSubmit = () => {
    if (selectedIds.size === 0)
      return
    assignMutation.mutate(Array.from(selectedIds))
  }

  const subjects = availableSubjects || []

  // Group by category
  const groupedSubjects = subjects.reduce(
    (acc: Record<string, any[]>, subject: any) => {
      const category = subject.subject?.category || 'Autre'
      if (!acc[category])
        acc[category] = []
      acc[category]?.push(subject)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.academic.assignments.dialogTitle()}</DialogTitle>
          <DialogDescription>
            {t.academic.assignments.dialogDescription()}
            {' '}
            <span className="font-medium text-foreground">{teacherName}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading
            ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )
            : subjects.length === 0
              ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>{t.academic.assignments.noAvailableSubjects()}</p>
                    <p className="text-sm">
                      {t.academic.assignments.allSubjectsAssigned()}
                    </p>
                  </div>
                )
              : (
                  <div className="space-y-6">
                    {Object.entries(groupedSubjects).map(([
                      category,
                      categorySubjects,
                    ]) => (
                      <div key={category} className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {(categorySubjects as any[]).map((item: any) => (
                            <div
                              key={item.subjectId}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  setSelectedIds((prev) => {
                                    const next = new Set(prev)
                                    if (next.has(item.subjectId)) {
                                      next.delete(item.subjectId)
                                    }
                                    else {
                                      next.add(item.subjectId)
                                    }
                                    return next
                                  })
                                }
                              }}
                              className={`
                          flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors
                          ${selectedIds.has(item.subjectId) ? 'border-primary bg-primary/5' : 'hover:bg-accent'}
                        `}
                              onClick={() => handleToggle(item.subjectId)}
                            >
                              <Checkbox
                                checked={selectedIds.has(item.subjectId)}
                                onCheckedChange={() => handleToggle(item.subjectId)}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {item.subject?.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.subject?.shortName}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {t.academic.assignments.selectedCount({
              count: selectedIds.size,
            })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel()}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedIds.size === 0 || assignMutation.isPending}
            >
              {assignMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t.academic.assignments.assignSelected()}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
