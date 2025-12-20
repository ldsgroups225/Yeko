import { AlertCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
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
            <FileText className="h-5 w-5" />
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
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-muted"
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
                          <span className="ml-2 text-muted-foreground text-sm">
                            (
                            {student.matricule}
                            )
                          </span>
                        )}
                      </Label>
                      {student.hasReportCard && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
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
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              {t.reportCards.generatingProgress({ progress: Math.round(progress) })}
            </p>
          </div>
        )}

        {state === 'complete' && result && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              {result.failed === 0
                ? (
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  )
                : (
                    <AlertCircle className="h-12 w-12 text-yellow-500" />
                  )}
            </div>

            <div className="text-center space-y-1">
              <p className="font-semibold">
                {t.reportCards.generationComplete()}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.reportCards.generationSummary({
                  success: result.success,
                  total: result.total,
                })}
              </p>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-md bg-destructive/10 p-3">
                <p className="text-sm font-medium text-destructive mb-2">
                  {t.reportCards.generationErrors({ count: result.failed })}
                </p>
                <ul className="text-sm text-destructive/80 space-y-1">
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
