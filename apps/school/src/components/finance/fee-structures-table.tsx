'use client'

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
import { useTranslations } from '@/i18n'
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
  isLoading?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

function formatCurrency(amount: number, currency: string = 'XOF') {
  return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency === 'XOF' ? 'FCFA' : currency}`
}

export function FeeStructuresTable({ feeStructures, isLoading, onEdit, onDelete }: FeeStructuresTableProps) {
  const t = useTranslations()

  if (isLoading) {
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
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-xl bg-card/10 m-4">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <IconStack2 className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">{t.finance.feeStructures.noFeeStructures()}</p>
        <p className="text-sm max-w-sm mt-1 text-muted-foreground/70">{t.finance.feeStructures.description()}</p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="font-semibold">{t.finance.feeTypes.title()}</TableHead>
              <TableHead className="font-semibold">{t.grades.grade()}</TableHead>
              <TableHead className="font-semibold">{t.classes.series()}</TableHead>
              <TableHead className="text-right font-semibold">{t.finance.amount()}</TableHead>
              <TableHead className="text-right font-semibold">{t.finance.feeStructures.newStudentAmount()}</TableHead>
              <TableHead className="text-right font-semibold">{t.common.actions()}</TableHead>
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
                  className="group hover:bg-muted/30 border-border/40 transition-colors"
                >
                  <TableCell>
                    <div>
                      <span className="font-bold text-foreground">{structure.feeTypeName}</span>
                      <Badge variant="outline" className="ml-2 text-[10px] font-mono tracking-wider bg-muted/50">
                        {structure.feeTypeCode}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{structure.gradeName}</TableCell>
                  <TableCell>
                    {structure.seriesName
                      ? (
                          <Badge variant="secondary" className="bg-secondary/50 font-medium">
                            {structure.seriesName}
                          </Badge>
                        )
                      : (
                          <span className="text-muted-foreground italic text-sm">-</span>
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
                          <span className="font-medium tabular-nums text-muted-foreground">
                            {formatCurrency(structure.newStudentAmount, structure.currency)}
                          </span>
                        )
                      : (
                          <span className="text-muted-foreground italic text-sm">-</span>
                        )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-muted"
                        onClick={() => onEdit?.(structure.id)}
                        aria-label={t.common.edit()}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        onClick={() => onDelete?.(structure.id)}
                        aria-label={t.common.delete()}
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

      <div className="md:hidden space-y-4 p-4">
        <AnimatePresence>
          {feeStructures.map((structure, index) => (
            <motion.div
              key={structure.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-md space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{structure.feeTypeName}</div>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">{structure.feeTypeCode}</div>
                </div>
                {structure.seriesName
                  ? (
                      <Badge variant="secondary" className="bg-secondary/50">
                        {structure.seriesName}
                      </Badge>
                    )
                  : (
                      <span className="text-xs text-muted-foreground italic">
                        {t.grades.grade()}
                        {' '}
                        {structure.gradeName}
                      </span>
                    )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.finance.amount()}</div>
                  <div className="font-bold text-lg">{formatCurrency(structure.amount, structure.currency)}</div>
                </div>
                {structure.newStudentAmount && (
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.finance.feeStructures.newStudentAmount()}</div>
                    <div className="font-bold text-lg text-muted-foreground">{formatCurrency(structure.newStudentAmount, structure.currency)}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
                <Button size="sm" variant="ghost" className="h-8 rounded-lg" onClick={() => onEdit?.(structure.id)}>
                  <IconPencil className="mr-2 h-3.5 w-3.5" />
                  {t.common.edit()}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete?.(structure.id)}>
                  <IconTrash className="mr-2 h-3.5 w-3.5" />
                  {t.common.delete()}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
