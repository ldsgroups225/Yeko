import type { TimetableImportProps } from './timetable-import/types'
import { IconLoader2 } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Suspense } from 'react'
import { useTranslations } from '@/i18n'
import { useTimetableImport } from './timetable-import/timetable-import-context'
import { TimetableImportPreview } from './timetable-import/timetable-import-preview'
import { TimetableImportProvider } from './timetable-import/timetable-import-provider'
import { TimetableImportResults } from './timetable-import/timetable-import-results'
import { TimetableImportUpload } from './timetable-import/timetable-import-upload'

function TimetableImportDialogInner() {
  const t = useTranslations()
  const { state, actions } = useTimetableImport()
  const { result, countValid, isPending } = state
  const { handleClose, handleImport } = actions

  return (
    <DialogContent className="max-w-4xl backdrop-blur-xl bg-card/95 border-border/40">
      <DialogHeader>
        <DialogTitle>{t.timetables.importTitle()}</DialogTitle>
        <DialogDescription>
          {t.timetables.downloadTemplateDescription()}
        </DialogDescription>
      </DialogHeader>

      {result
        ? (
            <TimetableImportResults />
          )
        : (
            <div className="space-y-6">
              <TimetableImportUpload />
              <TimetableImportPreview />

              <DialogFooter>
                <Button variant="ghost" onClick={handleClose}>
                  {t.common.cancel()}
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={countValid === 0 || isPending}
                >
                  {isPending && (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t.common.import()}
                  {' '}
                  (
                  {countValid}
                  )
                </Button>
              </DialogFooter>
            </div>
          )}
    </DialogContent>
  )
}

export function TimetableImportDialog(props: TimetableImportProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <Suspense fallback={<IconLoader2 className="h-8 w-8 animate-spin mx-auto" />}>
        <TimetableImportProvider {...props}>
          <TimetableImportDialogInner />
        </TimetableImportProvider>
      </Suspense>
    </Dialog>
  )
}
