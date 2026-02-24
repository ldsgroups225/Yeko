import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'

interface ImportResult {
  success: number
  errors: Array<{ row: number, error: string }>
}

interface ImportResultAlertProps {
  result: ImportResult | null
}

export function ImportResultAlert({ result }: ImportResultAlertProps) {
  const t = useTranslations()

  if (!result)
    return null

  return (
    <div className="space-y-4">
      <Alert variant={result.errors.length > 0 ? 'destructive' : 'default'}>
        {result.errors.length > 0
          ? (
              <IconAlertCircle className="h-4 w-4" />
            )
          : (
              <IconCircleCheck className="h-4 w-4" />
            )}
        <AlertTitle>{t.students.importComplete()}</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 space-y-1 text-sm">
            <li>{t.students.importSuccessCount({ count: result.success })}</li>
            {result.errors.length > 0 && (
              <li className="text-destructive">
                {t.students.importErrorCount({ count: result.errors.length })}
              </li>
            )}
          </ul>
        </AlertDescription>
      </Alert>

      {result.errors.length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded border p-3 text-sm">
          {result.errors.slice(0, 10).map(err => (
            <p key={`error-${err.row}-${generateUUID()}`} className="text-destructive">
              {t.students.importRowError({ row: err.row, error: err.error })}
            </p>
          ))}
          {result.errors.length > 10 && (
            <p className="mt-2 text-muted-foreground">
              {t.common.andMore({ count: result.errors.length - 10 })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
