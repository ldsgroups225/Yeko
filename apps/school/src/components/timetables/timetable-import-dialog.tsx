import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from '@/i18n'
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
  const t = useTranslations()
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
      <DialogContent className="max-w-md backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight italic">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            {t.timetables.importTimetable()}
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-muted-foreground/60 italic">
            {t.timetables.importDescription()}
          </DialogDescription>
        </DialogHeader>

        {state === 'idle' && (
          <>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.common.selectFile()}</Label>
                <div className="relative group cursor-pointer">
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 h-12 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-medium pt-1.5"
                  />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground pl-1 opacity-70">
                  {t.timetables.supportedFormats()}
                </p>
              </div>

              {file && (
                <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 p-3">
                  <div className="p-2 bg-background rounded-lg shadow-sm">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-foreground">{file.name}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {(file.size / 1024).toFixed(1)}
                      {' '}
                      KB
                    </p>
                  </div>
                </div>
              )}

              <div
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setReplaceExisting(!replaceExisting)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setReplaceExisting(!replaceExisting)
                  }
                }}
              >
                <Checkbox
                  id="replaceExisting"
                  checked={replaceExisting}
                  onCheckedChange={checked => setReplaceExisting(checked === true)}
                  className="rounded-md border-border/60 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                />
                <Label htmlFor="replaceExisting" className="text-sm font-bold cursor-pointer flex-1">
                  {t.timetables.replaceExisting()}
                </Label>
              </div>

              {replaceExisting && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/10 p-4 flex gap-3 text-destructive animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="text-xs font-medium leading-relaxed">
                    {t.timetables.replaceWarning()}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} className="rounded-xl font-bold uppercase tracking-wider text-xs">
                {t.common.cancel()}
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file}
                className="rounded-xl font-bold uppercase tracking-wider text-xs bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Upload className="mr-2 h-4 w-4" />
                {t.common.import()}
              </Button>
            </DialogFooter>
          </>
        )}

        {(state === 'uploading' || state === 'processing') && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
              </div>
              <p className="text-center font-bold text-lg animate-pulse">
                {state === 'uploading'
                  ? t.timetables.uploading()
                  : t.timetables.processing()}
              </p>
            </div>
            <div className="space-y-1">
              <Progress value={progress} className="h-2 rounded-full" />
              <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {progress}
                %
              </p>
            </div>
          </div>
        )}

        {state === 'complete' && result && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-background border shadow-lg">
                {result.failed === 0
                  ? (
                      <CheckCircle2 className="h-12 w-12 text-green-500" />
                    )
                  : (
                      <AlertCircle className="h-12 w-12 text-yellow-500" />
                    )}
              </div>

              <div className="text-center space-y-1">
                <p className="text-xl font-black uppercase italic tracking-tight">{t.timetables.importComplete()}</p>
                <p className="text-sm font-medium text-muted-foreground">
                  {t.timetables.importSummary({
                    success: result.success,
                    total: result.total,
                  })}
                </p>
              </div>
            </div>

            {result.conflicts.length > 0 && (
              <div className="rounded-xl bg-destructive/5 border border-destructive/10 p-4 max-h-48 overflow-y-auto custom-scrollbar">
                <p className="text-xs font-black uppercase text-destructive mb-3 tracking-widest sticky top-0 bg-destructive/5 py-1 backdrop-blur-sm">
                  {t.timetables.importConflicts({ count: result.failed })}
                </p>
                <ul className="text-sm font-medium text-destructive/80 space-y-2">
                  {result.conflicts.slice(0, 5).map(c => (
                    <li key={generateUUID()} className="flex gap-2 items-start bg-background/50 p-2 rounded-lg">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                      <div>
                        <span className="font-bold text-xs uppercase opacity-75">
                          {t.timetables.row()}
                          {' '}
                          {c.index + 1}
                          :
                        </span>
                        <span className="block text-xs">{c.message}</span>
                      </div>
                    </li>
                  ))}
                  {result.conflicts.length > 5 && (
                    <li className="text-xs font-bold italic opacity-70 text-center pt-2">
                      {t.common.andMore({ count: result.conflicts.length - 5 })}
                    </li>
                  )}
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose} className="w-full rounded-xl font-bold uppercase tracking-wider text-xs">{t.common.close()}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
