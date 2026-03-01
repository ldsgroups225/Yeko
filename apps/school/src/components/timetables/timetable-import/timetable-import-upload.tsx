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

      <div className="
        border-muted rounded-lg border-2 border-dashed p-6 text-center
      "
      >
        {file
          ? (
              <div className="flex items-center justify-center gap-4">
                <IconFileSpreadsheet className="text-primary h-8 w-8" />
                <div className="text-left">
                  <p className="font-bold">{file.name}</p>
                  <p className="text-muted-foreground text-sm">
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
              <label className="block cursor-pointer">
                <IconUpload className="
                  text-muted-foreground mx-auto mb-2 h-10 w-10
                "
                />
                <span className="
                  text-primary font-medium
                  hover:underline
                "
                >
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
