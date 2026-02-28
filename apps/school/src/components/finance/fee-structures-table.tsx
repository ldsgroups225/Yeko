import { IconPencil, IconStack2, IconTrash } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { generateUUID } from '@/utils/generateUUID'

interface FeeStructure {
  id: string
  feeTypeName: string
  feeTypeCode: string
  gradeName: string
  seriesName?: string
  amount: number
  newStudentAmount?: number
  currency: string
}

interface FeeStructuresTableProps {
  feeStructures: FeeStructure[]
  isPending?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

function formatCurrency(amount: number, currency: string = 'XOF') {
  return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency === 'XOF' ? 'FCFA' : currency}`
}

export function FeeStructuresTable({
  feeStructures,
  isPending,
  onEdit,
  onDelete,
}: FeeStructuresTableProps) {
  const { t } = useTranslation()

  if (isPending) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (feeStructures.length === 0) {
    return (
      <div className="
        text-muted-foreground border-border/30 bg-card/10 m-4 flex flex-col
        items-center justify-center rounded-xl border-2 border-dashed py-16
        text-center
      "
      >
        <div className="bg-muted/20 mb-4 rounded-full p-4">
          <IconStack2 className="text-muted-foreground/50 h-8 w-8" />
        </div>
        <p className="text-lg font-medium">
          {t('finance.feeStructures.noFeeStructures')}
        </p>
        <p className="text-muted-foreground/70 mt-1 max-w-sm text-sm">
          {t('finance.feeStructures.description')}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="
        hidden
        md:block
      "
      >
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="
              border-border/40
              hover:bg-transparent
            "
            >
              <TableHead className="font-semibold">
                {t('finance.feeTypes.title')}
              </TableHead>
              <TableHead className="font-semibold">
                {t('classes.grade')}
              </TableHead>
              <TableHead className="font-semibold">
                {t('classes.series')}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t('finance.amount')}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t('finance.feeStructures.newStudentAmount')}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {feeStructures.map((structure, index) => (
                <motion.tr
                  key={structure.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="
                    group
                    hover:bg-muted/30
                    border-border/40 transition-colors
                  "
                >
                  <TableCell>
                    <div>
                      <span className="text-foreground font-bold">
                        {structure.feeTypeName}
                      </span>
                      <Badge
                        variant="outline"
                        className="
                          bg-muted/50 ml-2 font-mono text-[10px] tracking-wider
                        "
                      >
                        {structure.feeTypeCode}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {structure.gradeName || t('finance.feeStructures.allLevels')}
                  </TableCell>
                  <TableCell>
                    {structure.seriesName
                      ? (
                          <Badge
                            variant="secondary"
                            className="bg-secondary/50 font-medium"
                          >
                            {structure.seriesName}
                          </Badge>
                        )
                      : (
                          <span className="text-muted-foreground text-sm italic">
                            {t('finance.feeStructures.allSeries')}
                          </span>
                        )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold tabular-nums">
                      {formatCurrency(structure.amount, structure.currency)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {structure.newStudentAmount
                      ? (
                          <span className="
                            text-muted-foreground font-medium tabular-nums
                          "
                          >
                            {formatCurrency(
                              structure.newStudentAmount,
                              structure.currency,
                            )}
                          </span>
                        )
                      : (
                          <span className="text-muted-foreground text-sm italic">
                            -
                          </span>
                        )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="
                      flex justify-end gap-1 opacity-0 transition-opacity
                      group-hover:opacity-100
                    "
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="
                          hover:bg-muted
                          h-8 w-8 rounded-lg
                        "
                        onClick={() => onEdit?.(structure.id)}
                        aria-label={t('common.edit')}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="
                          text-destructive
                          hover:text-destructive hover:bg-destructive/10
                          h-8 w-8 rounded-lg
                        "
                        onClick={() => onDelete?.(structure.id)}
                        aria-label={t('common.delete')}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="
        space-y-4 p-4
        md:hidden
      "
      >
        <AnimatePresence>
          {feeStructures.map((structure, index) => (
            <motion.div
              key={structure.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="
                bg-card/50 border-border/40 space-y-4 rounded-2xl border p-4
                backdrop-blur-md
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold">
                    {structure.feeTypeName}
                  </div>
                  <div className="
                    text-muted-foreground mt-0.5 font-mono text-xs
                  "
                  >
                    {structure.feeTypeCode}
                  </div>
                </div>
                {structure.seriesName
                  ? (
                      <Badge variant="secondary" className="bg-secondary/50">
                        {structure.seriesName}
                      </Badge>
                    )
                  : (
                      <span className="text-muted-foreground text-xs italic">
                        {t('classes.grade')}
                        {' '}
                        {structure.gradeName || t('finance.feeStructures.allLevels')}
                      </span>
                    )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="
                  bg-muted/20 border-border/20 rounded-xl border p-3
                "
                >
                  <div className="
                    text-muted-foreground mb-1 text-xs tracking-wider uppercase
                  "
                  >
                    {t('finance.amount')}
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(structure.amount, structure.currency)}
                  </div>
                </div>
                {structure.newStudentAmount && (
                  <div className="
                    bg-muted/20 border-border/20 rounded-xl border p-3
                  "
                  >
                    <div className="
                      text-muted-foreground mb-1 text-xs tracking-wider
                      uppercase
                    "
                    >
                      {t('finance.feeStructures.newStudentAmount')}
                    </div>
                    <div className="text-muted-foreground text-lg font-bold">
                      {formatCurrency(
                        structure.newStudentAmount,
                        structure.currency,
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="
                border-border/30 flex justify-end gap-2 border-t pt-2
              "
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-lg"
                  onClick={() => onEdit?.(structure.id)}
                >
                  <IconPencil className="mr-2 h-3.5 w-3.5" />
                  {t('common.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="
                    text-destructive
                    hover:text-destructive hover:bg-destructive/10
                    h-8 rounded-lg
                  "
                  onClick={() => onDelete?.(structure.id)}
                >
                  <IconTrash className="mr-2 h-3.5 w-3.5" />
                  {t('common.delete')}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
