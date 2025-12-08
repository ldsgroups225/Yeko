import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ExportFormat = 'pdf' | 'csv' | 'xlsx'

interface TimetableExportButtonProps {
  onExport: (format: ExportFormat) => Promise<void>
  disabled?: boolean
}

export function TimetableExportButton({
  onExport,
  disabled,
}: TimetableExportButtonProps) {
  const { t } = useTranslation()
  const [isExporting, setIsExporting] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)

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
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          {isExporting
            ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )
            : (
              <Download className="mr-2 h-4 w-4" />
            )}
          {t('common.export')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
        >
          <FileText className="mr-2 h-4 w-4" />
          {exportingFormat === 'pdf' ? t('common.exporting') : 'PDF'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {exportingFormat === 'csv' ? t('common.exporting') : 'CSV'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('xlsx')}
          disabled={isExporting}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {exportingFormat === 'xlsx' ? t('common.exporting') : 'Excel'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
