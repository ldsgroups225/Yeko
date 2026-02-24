import {
  IconDownload,
  IconFileSpreadsheet,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'
import { useTimetableImport } from './timetable-import-context'

export function TimetableImportUpload() {
  const t = useTranslations()
  const { state, actions } = useTimetableImport()
  const { file, allParsed, parseError } = state
  const { handleFileChange, setFile, downloadTemplate } = actions

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Button variant="outline" onClick={downloadTemplate} size="sm">
          <IconDownload className="mr-2 h-4 w-4" />
          {t.timetables.downloadTemplate()}
        </Button>
      </div>

      <div className="rounded-lg border-2 border-dashed p-6 text-center border-muted">
        {file
          ? (
              <div className="flex items-center justify-center gap-4">
                <IconFileSpreadsheet className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-bold">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {allParsed.length}
                    {' '}
                    {t.timetables.preview.totalLines()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            )
          : (
              <label className="cursor-pointer block">
                <IconUpload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <span className="font-medium text-primary hover:underline">
                  {t.timetables.importDescription()}
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
      </div>

      {parseError && (
        <p className="text-destructive text-sm font-medium">
          {parseError}
        </p>
      )}
    </div>
  )
}
