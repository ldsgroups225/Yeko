import { IconAlertCircle, IconCircleCheck, IconFileText, IconLoader2 } from '@tabler/icons-react'
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
import { Label } from '@workspace/ui/components/label'
import { Progress } from '@workspace/ui/components/progress'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { useState } from 'react'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'

interface Student {
  id: string
  name: string
  matricule?: string
  hasReportCard?: boolean
}

interface BulkGenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Student[]
  className: string
  termName: string
  onGenerate: (studentIds: string[]) => Promise<{
    total: number
    success: number
    failed: number
    errors: { studentId: string, error: string }[]
  }>
}

type GenerationState = 'idle' | 'generating' | 'complete'

export function BulkGenerationDialog({
  open,
  onOpenChange,
  students,
  className,
  termName,
  onGenerate,
}: BulkGenerationDialogProps) {
  const t = useTranslations()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() =>
    new Set(students.map(s => s.id)),
  )
  const [state, setState] = useState<GenerationState>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    total: number
    success: number
    failed: number
    errors: { studentId: string, error: string }[]
  } | null>(null)

  const toggleStudent = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    }
    else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const toggleAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set())
    }
    else {
      setSelectedIds(new Set(students.map(s => s.id)))
    }
  }

  const handleGenerate = async () => {
    setState('generating')
    setProgress(0)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90))
    }, 500)

    try {
      const generationResult = await onGenerate(Array.from(selectedIds))
      setResult(generationResult)
      setProgress(100)
    }
    finally {
      clearInterval(progressInterval)
      setState('complete')
    }
  }

  const handleClose = () => {
    if (state !== 'generating') {
      setState('idle')
      setProgress(0)
      setResult(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileText className="h-5 w-5" />
            {t.reportCards.bulkGeneration()}
          </DialogTitle>
          <DialogDescription>
            {t.reportCards.bulkGenerationDescription({ className, termName })}
          </DialogDescription>
        </DialogHeader>

        {state === 'idle' && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t.reportCards.selectStudents()}
                  {' '}
                  (
                  {selectedIds.size}
                  /
                  {students.length}
                  )
                </Label>
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {selectedIds.size === students.length
                    ? t.common.deselectAll()
                    : t.common.selectAll()}
                </Button>
              </div>

              <ScrollArea className="h-64 rounded-md border p-2">
                <div className="space-y-2">
                  {students.map(student => (
                    <div
                      key={student.id}
                      className="
                        hover:bg-muted
                        flex items-center gap-3 rounded-md p-2
                      "
                    >
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={selectedIds.has(student.id)}
                        onCheckedChange={() => toggleStudent(student.id)}
                      />
                      <Label
                        htmlFor={`student-${student.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <span className="font-medium">{student.name}</span>
                        {student.matricule && (
                          <span className="text-muted-foreground ml-2 text-sm">
                            (
                            {student.matricule}
                            )
                          </span>
                        )}
                      </Label>
                      {student.hasReportCard && (
                        <IconCircleCheck className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t.common.cancel()}
              </Button>
              <Button onClick={handleGenerate} disabled={selectedIds.size === 0}>
                {t.reportCards.generate()}
                {' '}
                (
                {selectedIds.size}
                )
              </Button>
            </DialogFooter>
          </>
        )}

        {state === 'generating' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <IconLoader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-muted-foreground text-center text-sm">
              {t.reportCards.generatingProgress({ progress: Math.round(progress) })}
            </p>
          </div>
        )}

        {state === 'complete' && result && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              {result.failed === 0
                ? (
                    <IconCircleCheck className="h-12 w-12 text-green-500" />
                  )
                : (
                    <IconAlertCircle className="text-accent h-12 w-12" />
                  )}
            </div>

            <div className="space-y-1 text-center">
              <p className="font-semibold">
                {t.reportCards.generationComplete()}
              </p>
              <p className="text-muted-foreground text-sm">
                {t.reportCards.generationSummary({
                  success: result.success,
                  total: result.total,
                })}
              </p>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-destructive/10 rounded-md p-3">
                <p className="text-destructive mb-2 text-sm font-medium">
                  {t.reportCards.generationErrors({ count: result.failed })}
                </p>
                <ul className="text-destructive/80 space-y-1 text-sm">
                  {result.errors.slice(0, 3).map(err => (
                    <li key={generateUUID()}>
                      •
                      {err.error}
                    </li>
                  ))}
                  {result.errors.length > 3 && (
                    <li>
                      •
                      {t.common.andMore({ count: result.errors.length - 3 })}
                    </li>
                  )}
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>{t.common.close()}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
