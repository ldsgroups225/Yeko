import type { TranslationFunctions } from '@/i18n'
import { IconBook, IconCheck, IconLoader2 } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { schoolSubjectsOptions } from '@/lib/queries/school-subjects'
import {
  teacherSubjectsKeys,
  teacherSubjectsOptions,
} from '@/lib/queries/teacher-subjects'
import { cn } from '@/lib/utils'
import { saveTeacherAssignments } from '@/school/functions/teacher-subjects'

interface SubjectBase {
  id: string
  subjectId: string
  subject?: {
    id: string
    name: string
    shortName: string | null
    category: string | null
  }
}

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
  const queryClient = useQueryClient()

  const { data: schoolSubjectsResult, isPending: isPendingAll } = useQuery({
    ...schoolSubjectsOptions.list({ schoolYearId: schoolYearId ?? '' }),
    enabled: open && !!schoolYearId,
  })

  const { data: assignedSubjectsResult, isPending: isPendingAssigned } = useQuery({
    ...teacherSubjectsOptions.list(teacherId),
    enabled: open && !!teacherId,
  })

  const isPending = isPendingAll || isPendingAssigned

  const assignMutation = useMutation({
    mutationKey: schoolMutationKeys.teachers.assign,
    mutationFn: (subjectIds: string[]) =>
      saveTeacherAssignments({
        data: {
          teacherId,
          subjectIds,
        },
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error)
        return
      }
      queryClient.invalidateQueries({ queryKey: teacherSubjectsKeys.all })
      toast.success(
        t.academic.assignments.assignSuccess({
          count: result.data.length,
          teacherName,
        }),
      )
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t.academic.assignments.assignError())
    },
  })

  const subjects = (schoolSubjectsResult ? (schoolSubjectsResult.subjects || []) : [])
  const assignedIds = assignedSubjectsResult ? (assignedSubjectsResult.map(a => a.subjectId)) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        bg-card/95 border-border/40 max-w-2xl overflow-hidden p-0
        backdrop-blur-xl
      "
      >
        <div className="border-border/10 border-b bg-white/5 p-6 pb-4">
          <DialogHeader>
            <div className="mb-1 flex items-center gap-3">
              <div className="
                bg-primary/10 flex h-10 w-10 items-center justify-center
                rounded-xl
              "
              >
                <IconBook className="text-primary h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{t.academic.assignments.dialogTitle()}</DialogTitle>
                <DialogDescription className="
                  text-xs font-semibold tracking-wider uppercase opacity-70
                "
                >
                  {teacherName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="h-[450px] px-6 py-4">
          <AnimatePresence mode="wait">
            {isPending
              ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="
                      flex h-[350px] flex-col items-center justify-center gap-3
                    "
                  >
                    <IconLoader2 className="
                      text-primary/40 h-8 w-8 animate-spin
                    "
                    />
                    <p className="text-muted-foreground animate-pulse text-sm">{t.common.loading()}</p>
                  </motion.div>
                )
              : (
                  <AssignmentList
                    subjects={subjects}
                    assignedIds={assignedIds}
                    onAssign={ids => assignMutation.mutate(ids)}
                    isPending={assignMutation.isPending}
                    onCancel={() => onOpenChange(false)}
                    t={t}
                  />
                )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface AssignmentListProps {
  subjects: SubjectBase[]
  assignedIds: string[]
  onAssign: (ids: string[]) => void
  isPending: boolean
  onCancel: () => void
  t: TranslationFunctions
}

function AssignmentList({ subjects, assignedIds, onAssign, isPending, onCancel, t }: AssignmentListProps) {
  const [selectedIds, setSelectedIds] = useState(() => new Set(assignedIds))

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

  const groupedSubjects = useMemo(() => subjects.reduce(
    (acc, item) => {
      const category = item.subject?.category || 'Autre'
      if (!acc[category])
        acc[category] = []
      acc[category]?.push(item)
      return acc
    },
    {} as Record<string, SubjectBase[]>,
  ), [subjects])

  if (subjects.length === 0) {
    return (
      <motion.div
        key="empty"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          flex h-[350px] flex-col items-center justify-center space-y-4
          text-center
        "
      >
        <div className="
          flex h-16 w-16 items-center justify-center rounded-full bg-white/5
        "
        >
          <IconBook className="text-muted-foreground/30 h-8 w-8" />
        </div>
        <div className="space-y-1">
          <p className="text-foreground font-semibold">{t.academic.assignments.noAvailableSubjects()}</p>
          <p className="text-muted-foreground max-w-[280px] text-sm">
            {t.academic.assignments.allSubjectsAssigned()}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 pb-4"
      >
        {Object.entries(groupedSubjects).map(([category, categorySubjects], catIdx) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <h4 className="
                text-muted-foreground text-[10px] font-bold tracking-[0.2em]
                uppercase
              "
              >
                {category}
              </h4>
              <div className="bg-border/20 h-px flex-1" />
            </div>
            <div className="
              grid grid-cols-1 gap-3
              sm:grid-cols-2
            "
            >
              {categorySubjects.map((item, idx) => {
                const isSelected = selectedIds.has(item.subjectId)
                return (
                  <motion.div
                    key={item.subjectId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (catIdx * 0.1) + (idx * 0.05) }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleToggle(item.subjectId)}
                    className={cn(
                      `
                        group relative flex cursor-pointer items-center gap-4
                        overflow-hidden rounded-xl border p-4 transition-all
                      `,
                      isSelected
                        ? `
                          border-primary/50 bg-primary/10
                          shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]
                        `
                        : `
                          border-border/40
                          hover:border-primary/30
                          bg-white/5
                          hover:bg-white/10
                        `,
                    )}
                  >
                    <div className={cn(
                      `
                        flex h-10 w-10 shrink-0 items-center justify-center
                        rounded-lg transition-colors
                      `,
                      isSelected
                        ? 'bg-primary text-white'
                        : `text-muted-foreground bg-white/5`,
                    )}
                    >
                      {isSelected
                        ? <IconCheck className="h-5 w-5" />
                        : (
                            <IconBook className="h-5 w-5" />
                          )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate text-sm font-bold', isSelected
                        ? `text-primary`
                        : `text-foreground`)}
                      >
                        {item.subject?.name}
                      </p>
                      <p className="
                        text-muted-foreground text-[10px] font-semibold
                        tracking-wider uppercase
                      "
                      >
                        {item.subject?.shortName}
                      </p>
                    </div>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(item.subjectId)}
                      className="sr-only"
                    />
                    {isSelected && (
                      <div className="absolute top-0 right-0 p-1">
                        <div className="bg-primary h-1 w-1 rounded-full" />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </motion.div>

      <div className="
        border-border/10 fixed right-0 bottom-0 left-0 border-t bg-white/5 p-6
        backdrop-blur-md
      "
      >
        <DialogFooter className="
          flex flex-col items-center justify-between gap-4
          sm:flex-row
        "
        >
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 font-mono"
            >
              {selectedIds.size}
            </Badge>
            <span className="
              text-muted-foreground text-xs font-semibold tracking-tight
              uppercase
            "
            >
              {t.academic.assignments.selectedCount({ count: selectedIds.size })}
            </span>
          </div>
          <div className="
            flex w-full gap-2
            sm:w-auto
          "
          >
            <Button
              variant="ghost"
              onClick={onCancel}
              className="
                flex-1
                hover:bg-white/10
                sm:flex-none
              "
            >
              {t.common.cancel()}
            </Button>
            <Button
              onClick={() => onAssign(Array.from(selectedIds))}
              disabled={selectedIds.size === 0 || isPending}
              className="
                bg-primary
                hover:bg-primary/90
                shadow-primary/20 flex-1 shadow-lg
                sm:min-w-[140px]
              "
            >
              {isPending
                ? (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )
                : (
                    <IconCheck className="mr-2 h-4 w-4" />
                  )}
              {t.academic.assignments.assignSelected()}
            </Button>
          </div>
        </DialogFooter>
      </div>
    </>
  )
}
