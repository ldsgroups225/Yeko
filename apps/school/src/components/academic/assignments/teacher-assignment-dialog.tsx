import type { TranslationFunctions } from '@/i18n'
import { IconBook, IconCheck, IconLoader2, IconSparkles } from '@tabler/icons-react'
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

  const { data: schoolSubjectsResult, isLoading: loadingAll } = useQuery({
    ...schoolSubjectsOptions.list({ schoolYearId: schoolYearId ?? '' }),
    enabled: open && !!schoolYearId,
  })

  const { data: assignedSubjectsResult, isLoading: loadingAssigned } = useQuery({
    ...teacherSubjectsOptions.list(teacherId),
    enabled: open && !!teacherId,
  })

  const isLoading = loadingAll || loadingAssigned

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
      <DialogContent className="max-w-2xl backdrop-blur-xl bg-card/95 border-border/40 p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-border/10 bg-white/5">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <IconSparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{t.academic.assignments.dialogTitle()}</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-wider font-semibold opacity-70">
                  {teacherName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="h-[450px] px-6 py-4">
          <AnimatePresence mode="wait">
            {isLoading
              ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[350px] gap-3"
                  >
                    <IconLoader2 className="h-8 w-8 animate-spin text-primary/40" />
                    <p className="text-sm text-muted-foreground animate-pulse">{t.common.loading()}</p>
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
        className="flex flex-col items-center justify-center h-[350px] text-center space-y-4"
      >
        <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
          <IconBook className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{t.academic.assignments.noAvailableSubjects()}</p>
          <p className="text-sm text-muted-foreground max-w-[280px]">
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
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                {category}
              </h4>
              <div className="h-px flex-1 bg-border/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      'relative group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer overflow-hidden',
                      isSelected
                        ? 'border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]'
                        : 'border-border/40 bg-white/5 hover:border-primary/30 hover:bg-white/10',
                    )}
                  >
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      isSelected ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground',
                    )}
                    >
                      {isSelected ? <IconCheck className="h-5 w-5" /> : <IconBook className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-bold text-sm truncate', isSelected ? 'text-primary' : 'text-foreground')}>
                        {item.subject?.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
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
                        <div className="h-1 w-1 rounded-full bg-primary" />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/5 border-t border-border/10 backdrop-blur-md">
        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono bg-primary/10 text-primary border-primary/20">
              {selectedIds.size}
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">
              {t.academic.assignments.selectedCount({ count: selectedIds.size })}
            </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="flex-1 sm:flex-none hover:bg-white/10"
            >
              {t.common.cancel()}
            </Button>
            <Button
              onClick={() => onAssign(Array.from(selectedIds))}
              disabled={selectedIds.size === 0 || isPending}
              className="flex-1 sm:min-w-[140px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
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
