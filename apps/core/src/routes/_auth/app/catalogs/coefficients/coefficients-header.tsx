import type { RefObject } from 'react'
import { IconCopy, IconDownload, IconFileDownload, IconFileUpload, IconPlus } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'

interface CoefficientsHeaderProps {
  onDownloadTemplate: () => void
  onImportClick: () => void
  onExport: () => void
  onCopyFromPreviousYear: () => void
  onAddCoefficient: () => void
  isImporting: boolean
  isCopyPending: boolean
  hasCoefficients: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function CoefficientsHeader({
  onDownloadTemplate,
  onImportClick,
  onExport,
  onCopyFromPreviousYear,
  onAddCoefficient,
  isImporting,
  isCopyPending,
  hasCoefficients,
  fileInputRef,
  handleFileChange,
}: CoefficientsHeaderProps) {
  return (
    <div className="
      flex flex-col justify-between gap-4
      md:flex-row md:items-center
    "
    >
      <div>
        <h1 className="text-foreground/90 text-3xl font-bold tracking-tight">Coefficients</h1>
        <p className="text-muted-foreground">
          Gérer les coefficients des matières pour le calcul des moyennes
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownloadTemplate}
          className="
            hover:bg-primary/5 hover:text-primary
            transition-colors
          "
        >
          <IconFileDownload className="mr-2 h-4 w-4" />
          Modèle
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onImportClick}
          disabled={isImporting}
          className="
            hover:bg-primary/5 hover:text-primary
            transition-colors
          "
        >
          <IconFileUpload className="mr-2 h-4 w-4" />
          {isImporting ? 'Import...' : 'Importer'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={!hasCoefficients}
          className="
            hover:bg-primary/5 hover:text-primary
            transition-colors
          "
        >
          <IconDownload className="mr-2 h-4 w-4" />
          Exporter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopyFromPreviousYear}
          disabled={isCopyPending}
          className="
            hover:bg-primary/5 hover:text-primary
            transition-colors
          "
        >
          <IconCopy className="mr-2 h-4 w-4" />
          Copier
        </Button>
        <Button
          onClick={onAddCoefficient}
          className="
            bg-primary
            hover:bg-primary/90
            shadow-md transition-all
            active:scale-95
          "
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Nouveau
        </Button>
      </div>
    </div>
  )
}
