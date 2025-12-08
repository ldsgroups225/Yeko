import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { generateUUID } from '@/utils/generateUUID'

interface ImportResult {
  total: number
  success: number
  failed: number
  conflicts: { index: number, message: string }[]
}

interface TimetableImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (file: File, replaceExisting: boolean) => Promise<ImportResult>
}

type ImportState = 'idle' | 'uploading' | 'processing' | 'complete'

export function TimetableImportDialog({
  open,
  onOpenChange,
  onImport,
}: TimetableImportDialogProps) {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [state, setState] = useState<ImportState>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleImport = async () => {
    if (!file)
      return

    setState('uploading')
    setProgress(20)

    // Simulate upload progress
    await new Promise(resolve => setTimeout(resolve, 500))
    setState('processing')
    setProgress(50)

    try {
      const importResult = await onImport(file, replaceExisting)
      setResult(importResult)
      setProgress(100)
    }
    finally {
      setState('complete')
    }
  }

  const handleClose = () => {
    if (state !== 'uploading' && state !== 'processing') {
      setState('idle')
      setFile(null)
      setProgress(0)
      setResult(null)
      setReplaceExisting(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t('timetables.importTimetable')}
          </DialogTitle>
          <DialogDescription>
            {t('timetables.importDescription')}
          </DialogDescription>
        </DialogHeader>

        {state === 'idle' && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">{t('common.selectFile')}</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  {t('timetables.supportedFormats')}
                </p>
              </div>

              {file && (
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)}
                      {' '}
                      KB
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="replaceExisting"
                  checked={replaceExisting}
                  onCheckedChange={checked => setReplaceExisting(checked === true)}
                />
                <Label htmlFor="replaceExisting" className="text-sm cursor-pointer">
                  {t('timetables.replaceExisting')}
                </Label>
              </div>

              {replaceExisting && (
                <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  {t('timetables.replaceWarning')}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleImport} disabled={!file}>
                <Upload className="mr-2 h-4 w-4" />
                {t('common.import')}
              </Button>
            </DialogFooter>
          </>
        )}

        {(state === 'uploading' || state === 'processing') && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              {state === 'uploading'
                ? t('timetables.uploading')
                : t('timetables.processing')}
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
              <p className="font-semibold">{t('timetables.importComplete')}</p>
              <p className="text-sm text-muted-foreground">
                {t('timetables.importSummary', {
                  success: result.success,
                  total: result.total,
                })}
              </p>
            </div>

            {result.conflicts.length > 0 && (
              <div className="rounded-md bg-destructive/10 p-3 max-h-32 overflow-y-auto">
                <p className="text-sm font-medium text-destructive mb-2">
                  {t('timetables.importConflicts', { count: result.failed })}
                </p>
                <ul className="text-sm text-destructive/80 space-y-1">
                  {result.conflicts.slice(0, 5).map(c => (
                    <li key={generateUUID()}>
                      •
                      {t('timetables.row')}
                      {' '}
                      {c.index + 1}
                      :
                      {' '}
                      {c.message}
                    </li>
                  ))}
                  {result.conflicts.length > 5 && (
                    <li>
                      •
                      {t('common.andMore', { count: result.conflicts.length - 5 })}
                    </li>
                  )}
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>{t('common.close')}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
