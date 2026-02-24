import { formatPhone } from '@repo/data-ops'
import {
  IconAlertCircle,
  IconCircleCheck,
  IconDatabase,
  IconInfoCircle,
  IconLoader2,
  IconMail,
  IconPhone,
  IconShield,
  IconUpload,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'
import { useBulkImport } from './bulk-import-context'

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
}

export function BulkImportPreview() {
  const t = useTranslations()
  const { state, actions } = useBulkImport()
  const { preview, isProcessing } = state
  const { handleImport, reset } = actions

  if (preview.length === 0)
    return null

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-8 shadow-sm"
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconDatabase className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-serif font-semibold">{t.hr.users.step3()}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 bg-muted/50 border-border/40 font-semibold uppercase text-[10px] tracking-wider"
          >
            {preview.length}
            {' '}
            {t.hr.users.totalRows()}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 bg-success/10 text-success border-success/20 font-semibold uppercase text-[10px] tracking-wider"
          >
            {preview.filter(r => !r.error).length}
            {' '}
            {t.hr.users.validRows()}
          </Badge>
          {preview.filter(r => r.error).length > 0 && (
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 bg-destructive/10 text-destructive border-destructive/20 font-semibold uppercase text-[10px] tracking-wider"
            >
              {preview.filter(r => r.error).length}
              {' '}
              {t.hr.users.invalidRows()}
            </Badge>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-background/30 overflow-hidden mb-8 shadow-inner">
        <Table>
          <TableHeader className="bg-muted/50 backdrop-blur-md">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="w-[80px] text-xs uppercase tracking-wider font-bold py-4">
                {t.hr.users.status()}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold py-4">
                {t.hr.common.name()}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold py-4">
                {t.hr.common.email()}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold py-4">
                {t.hr.common.phone()}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold py-4">
                {t.hr.common.roles()}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold py-4">
                {t.hr.users.error()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((row, idx) => (
              <motion.tr
                key={`${row.email}-${generateUUID()}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="border-border/40 hover:bg-primary/5 transition-colors"
              >
                <TableCell className="py-4">
                  {row.error
                    ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                          <IconAlertCircle className="h-4 w-4" />
                        </div>
                      )
                    : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success">
                          <IconCircleCheck className="h-4 w-4" />
                        </div>
                      )}
                </TableCell>
                <TableCell className="font-semibold text-foreground py-4">
                  {row.name}
                </TableCell>
                <TableCell className="py-4 font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <IconMail className="h-3 w-3" />
                    {row.email}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-muted-foreground whitespace-nowrap">
                  {row.phone
                    ? (
                        <div className="flex items-center gap-1.5">
                          <IconPhone className="h-3 w-3" />
                          {formatPhone(row.phone)}
                        </div>
                      )
                    : '-'}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-1.5">
                    <IconShield className="h-3 w-3 text-primary/60" />
                    <span className="font-medium text-foreground">{row.roles}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {row.error && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-destructive uppercase tracking-tight">
                      <IconInfoCircle className="h-3 w-3" />
                      {row.error}
                    </div>
                  )}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end items-center gap-4">
        <Button
          variant="ghost"
          className="rounded-xl px-6 font-medium bg-muted hover:bg-muted/80 transition-colors"
          onClick={reset}
        >
          {t.common.cancel()}
        </Button>
        <Button
          onClick={handleImport}
          disabled={isProcessing || preview.filter(r => !r.error).length === 0}
          className="rounded-xl px-8 min-w-[160px] font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isProcessing
            ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground/80" />
                  {t.hr.users.importing()}
                </>
              )
            : (
                <>
                  <IconUpload className="mr-2 h-4 w-4 group-hover:-translate-y-0.5" />
                  {t.hr.users.importUsers()}
                </>
              )}
        </Button>
      </div>
    </motion.div>
  )
}
