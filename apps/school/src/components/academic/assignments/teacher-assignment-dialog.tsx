import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Check, Loader2, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'
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

  const { data: availableSubjects, isLoading } = useQuery({
    ...teacherSubjectsOptions.available(teacherId ?? undefined, schoolYearId ?? undefined),
    enabled: open && !!schoolYearId,
  })

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

  const groupedSubjects = subjects.reduce(
    (acc, subject) => {
      const category = subject.subject?.category || 'Autre'
      if (!acc[category])
        acc[category] = []
      acc[category]?.push(subject)
      return acc
    },
    {} as Record<string, typeof subjects>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl backdrop-blur-xl bg-card/95 border-border/40 p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-border/10 bg-white/5">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
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
                    <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                    <p className="text-sm text-muted-foreground animate-pulse">{t.common.loading()}</p>
                  </motion.div>
                )
              : subjects.length === 0
                ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center h-[350px] text-center space-y-4"
                    >
                      <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{t.academic.assignments.noAvailableSubjects()}</p>
                        <p className="text-sm text-muted-foreground max-w-[280px]">
                          {t.academic.assignments.allSubjectsAssigned()}
                        </p>
                      </div>
                    </motion.div>
                  )
                : (
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
                            {(categorySubjects).map((item, idx) => {
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
                                    {isSelected ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
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
                  )}
          </AnimatePresence>
        </ScrollArea>

        <div className="p-6 bg-white/5 border-t border-border/10">
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
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none hover:bg-white/10"
              >
                {t.common.cancel()}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedIds.size === 0 || assignMutation.isPending}
                className="flex-1 sm:min-w-[140px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                {assignMutation.isPending
                  ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )
                  : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                {t.academic.assignments.assignSelected()}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
