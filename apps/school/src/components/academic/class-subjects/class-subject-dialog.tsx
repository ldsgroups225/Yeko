import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { classSubjectsKeys } from '@/lib/queries/class-subjects'
import { saveClassSubject } from '@/school/functions/class-subjects'
import { getSchoolSubjects } from '@/school/functions/school-subjects' // Use school-subjects directly or via query options if available

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
  const { t } = useTranslation()
  const { schoolYearId } = useSchoolYearContext()
  const queryClient = useQueryClient()
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [coefficient, setCoefficient] = useState(2)
  const [hours, setHours] = useState(3)

  const { data: allSubjects, isLoading } = useQuery({
    queryKey: ['schoolSubjects', schoolYearId], // Should use proper keys
    queryFn: () => getSchoolSubjects({ data: { schoolYearId: schoolYearId! } }),
    enabled: open && !!schoolYearId,
  })

  const saveMutation = useMutation({
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
      toast.success(t('academic.classes.addSubjectSuccess'))
      setSelectedSubjectId(null)
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t('academic.classes.addSubjectError'))
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('academic.classes.addSubjectTitle')}</DialogTitle>
          <DialogDescription>
            {t('academic.classes.addSubjectDescription')}
            {' '}
            <span className="font-medium">{className}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t('academic.classes.selectSubject')}</Label>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              {isLoading
                ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="animate-spin" />
                    </div>
                  )
                : (
                    <div className="space-y-1">
                      {allSubjects?.subjects?.map((item: any) => (
                        <div
                          key={item.subjectId}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setSelectedSubjectId(item.subjectId)
                              setCoefficient(item.coefficient || 1)
                              setHours(item.hoursPerWeek || 1)
                            }
                          }}
                          className={`
                        flex items-center justify-between p-2 rounded-md cursor-pointer text-sm
                        ${selectedSubjectId === item.subjectId ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                      `}
                          onClick={() => setSelectedSubjectId(item.subjectId)}
                        >
                          <span className="font-medium">{item.subject.name}</span>
                          <span
                            className={`text-xs ${selectedSubjectId === item.subjectId ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                          >
                            {item.subject.shortName}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
            </ScrollArea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coeff">{t('academic.classes.coefficient')}</Label>
              <Input
                id="coeff"
                type="number"
                min="0"
                step="0.5"
                value={coefficient}
                onChange={e => setCoefficient(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">{t('academic.classes.hoursPerWeek')}</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                step="0.5"
                value={hours}
                onChange={e => setHours(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedSubjectId || saveMutation.isPending}
          >
            {saveMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t('academic.classes.addSubject')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
