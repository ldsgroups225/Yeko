import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import { DialogFooter } from '@workspace/ui/components/dialog'
import { useTranslations } from '@/i18n'
import { useTimetableImport } from './timetable-import-context'

export function TimetableImportResults() {
  const t = useTranslations()
  const { state, actions } = useTimetableImport()
  const { result } = state
  const { handleClose } = actions

  if (!result)
    return null

  return (
    <div className="space-y-4">
      <Alert variant={result.failed === 0 ? 'default' : 'destructive'}>
        {result.failed === 0
          ? <IconCircleCheck className="h-4 w-4" />
          : (
              <IconAlertCircle className="h-4 w-4" />
            )}
        <AlertTitle>{t.timetables.importComplete()}</AlertTitle>
        <AlertDescription>
          {t.timetables.importSummary({
            success: result.success,
            total: result.success + result.failed,
          })}
          {result.failed > 0 && ` - ${result.failed} ${t.timetables.status.error()}`}
        </AlertDescription>
      </Alert>
      <DialogFooter>
        <Button onClick={handleClose}>{t.common.close()}</Button>
      </DialogFooter>
    </div>
  )
}
