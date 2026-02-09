import { IconCheck, IconClock, IconHash, IconLoader2 } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { classSubjectsKeys } from '@/lib/queries/class-subjects'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { cn } from '@/lib/utils'
import { saveClassSubject } from '@/school/functions/class-subjects'
import { getSchoolSubjects } from '@/school/functions/school-subjects'

interface ClassSubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  className: string
}

export function ClassSubjectDialog({
  open,
  onOpenChange,
  classId,
  className,
}: ClassSubjectDialogProps) {
  const t = useTranslations()
  const { schoolYearId } = useSchoolYearContext()
  const queryClient = useQueryClient()
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [coefficient, setCoefficient] = useState(2)
  const [hours, setHours] = useState(3)

  const { data: result, isPending } = useQuery({
    queryKey: ['schoolSubjects', schoolYearId],
    queryFn: () => getSchoolSubjects({ data: { schoolYearId: schoolYearId! } }),
    enabled: open && !!schoolYearId,
  })

  const subjects = result?.success ? result.data.subjects : []

  const saveMutation = useMutation({
    mutationKey: schoolMutationKeys.classSubjects.create,
    mutationFn: (
      data: { subjectId: string, coefficient: number, hoursPerWeek: number },
    ) =>
      saveClassSubject({
        data: {
          classId,
          subjectId: data.subjectId,
          coefficient: data.coefficient,
          hoursPerWeek: data.hoursPerWeek,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: classSubjectsKeys.list({ classId }),
      })
      toast.success(t.academic.classes.addSubjectSuccess())
      setSelectedSubjectId(null)
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t.academic.classes.addSubjectError())
    },
  })

  const handleSave = () => {
    if (!selectedSubjectId)
      return
    saveMutation.mutate({
      subjectId: selectedSubjectId,
      coefficient: Number(coefficient),
      hoursPerWeek: Number(hours),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md backdrop-blur-xl bg-card/95 border-border/40 p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-border/10">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <IconHash className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{t.academic.classes.addSubjectTitle()}</DialogTitle>
                <DialogDescription className="text-xs font-semibold opacity-70 uppercase tracking-wider">
                  {className}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">
              {t.academic.classes.selectSubject()}
            </Label>
            <ScrollArea className="h-[240px] rounded-xl border border-border/10 bg-white/5 overflow-hidden">
              <AnimatePresence mode="wait">
                {isPending
                  ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full gap-3 py-10"
                      >
                        <IconLoader2 className="h-6 w-6 animate-spin text-primary/40" />
                        <p className="text-xs font-medium text-muted-foreground">{t.common.loading()}</p>
                      </motion.div>
                    )
                  : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-1.5 space-y-1"
                      >
                        {subjects.map((item) => {
                          const isSelected = selectedSubjectId === item.subjectId
                          return (
                            <div
                              key={item.subjectId}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  setSelectedSubjectId(item.subjectId)
                                }
                              }}
                              className={cn(
                                'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all',
                                isSelected
                                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                  : 'hover:bg-white/5 text-foreground',
                              )}
                              onClick={() => {
                                setSelectedSubjectId(item.subjectId)
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">{item.subject.name}</span>
                                <span className={cn('text-[10px] font-semibold uppercase tracking-wider', isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                                  {item.subject.shortName}
                                </span>
                              </div>
                              {isSelected && <IconCheck className="h-4 w-4" />}
                            </div>
                          )
                        })}
                      </motion.div>
                    )}
              </AnimatePresence>
            </ScrollArea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coeff" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                <IconHash className="h-3 w-3" />
                {t.academic.classes.coefficient()}
              </Label>
              <Input
                id="coeff"
                type="number"
                min="0"
                step="0.5"
                value={coefficient}
                onChange={e => setCoefficient(Number(e.target.value))}
                className="h-11 bg-white/5 border-border/10 focus:ring-primary/40 font-mono text-center font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                <IconClock className="h-3 w-3" />
                {t.academic.classes.hoursPerWeek()}
              </Label>
              <Input
                id="hours"
                type="number"
                min="0"
                step="0.5"
                value={hours}
                onChange={e => setHours(Number(e.target.value))}
                className="h-11 bg-white/5 border-border/10 focus:ring-primary/40 font-mono text-center font-bold"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-border/10">
          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none hover:bg-white/10"
            >
              {t.common.cancel()}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedSubjectId || saveMutation.isPending}
              className="flex-1 sm:min-w-[140px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {saveMutation.isPending
                ? (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )
                : (
                    <IconCheck className="mr-2 h-4 w-4" />
                  )}
              {t.academic.classes.addSubject()}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
