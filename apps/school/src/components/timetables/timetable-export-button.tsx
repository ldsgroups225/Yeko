import {
  IconDownload,
  IconFileSpreadsheet,
  IconFileText,
  IconLoader2,
} from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

import { useState } from 'react'
import { useTranslations } from '@/i18n'

type ExportFormat = 'pdf' | 'csv' | 'xlsx'

interface TimetableExportButtonProps {
  onExport: (format: ExportFormat) => Promise<void>
  disabled?: boolean
}

export function TimetableExportButton({
  onExport,
  disabled,
}: TimetableExportButtonProps) {
  const t = useTranslations()
  const [isExporting, setIsExporting] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(
    null,
  )

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    setExportingFormat(format)
    try {
      await onExport(format)
    }
    finally {
      setIsExporting(false)
      setExportingFormat(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(
          <Button variant="outline" disabled={disabled || isExporting}>
            {isExporting
              ? (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )
              : (
                  <IconDownload className="mr-2 h-4 w-4" />
                )}
            {t.common.export()}
          </Button>
        )}
      />
      <DropdownMenuContent
        align="end"
        className="w-48 backdrop-blur-xl bg-card/95 border-border/40 shadow-xl rounded-2xl p-1"
      >
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="rounded-xl focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5 font-medium text-sm"
        >
          <IconFileText className="mr-2 h-4 w-4" />
          {exportingFormat === 'pdf' ? t.common.exporting() : 'PDF'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="rounded-xl focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5 font-medium text-sm"
        >
          <IconFileSpreadsheet className="mr-2 h-4 w-4" />
          {exportingFormat === 'csv' ? t.common.exporting() : 'CSV'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('xlsx')}
          disabled={isExporting}
          className="rounded-xl focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5 font-medium text-sm"
        >
          <IconFileSpreadsheet className="mr-2 h-4 w-4" />
          {exportingFormat === 'xlsx' ? t.common.exporting() : 'Excel'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
