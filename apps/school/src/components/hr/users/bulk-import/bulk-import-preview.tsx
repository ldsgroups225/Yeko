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
      className="
        border-border/40 bg-card/50 rounded-xl border p-8 shadow-sm
        backdrop-blur-xl
      "
    >
      <div className="
        mb-8 flex flex-col justify-between gap-4
        sm:flex-row sm:items-center
      "
      >
        <div className="flex items-center gap-2">
          <div className="
            bg-primary/10 text-primary flex h-8 w-8 items-center justify-center
            rounded-lg
          "
          >
            <IconDatabase className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-semibold">{t.hr.users.step3()}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="
              bg-muted/50 border-border/40 rounded-full px-3 py-1 text-[10px]
              font-semibold tracking-wider uppercase
            "
          >
            {preview.length}
            {' '}
            {t.hr.users.totalRows()}
          </Badge>
          <Badge
            variant="outline"
            className="
              bg-success/10 text-success border-success/20 rounded-full px-3
              py-1 text-[10px] font-semibold tracking-wider uppercase
            "
          >
            {preview.filter(r => !r.error).length}
            {' '}
            {t.hr.users.validRows()}
          </Badge>
          {preview.filter(r => r.error).length > 0 && (
            <Badge
              variant="outline"
              className="
                bg-destructive/10 text-destructive border-destructive/20
                rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider
                uppercase
              "
            >
              {preview.filter(r => r.error).length}
              {' '}
              {t.hr.users.invalidRows()}
            </Badge>
          )}
        </div>
      </div>

      <div className="
        border-border/40 bg-background/30 mb-8 overflow-hidden rounded-xl border
        shadow-inner
      "
      >
        <Table>
          <TableHeader className="bg-muted/50 backdrop-blur-md">
            <TableRow className="
              border-border/40
              hover:bg-transparent
            "
            >
              <TableHead className="
                w-[80px] py-4 text-xs font-bold tracking-wider uppercase
              "
              >
                {t.hr.users.status()}
              </TableHead>
              <TableHead className="
                py-4 text-xs font-bold tracking-wider uppercase
              "
              >
                {t.hr.common.name()}
              </TableHead>
              <TableHead className="
                py-4 text-xs font-bold tracking-wider uppercase
              "
              >
                {t.hr.common.email()}
              </TableHead>
              <TableHead className="
                py-4 text-xs font-bold tracking-wider uppercase
              "
              >
                {t.hr.common.phone()}
              </TableHead>
              <TableHead className="
                py-4 text-xs font-bold tracking-wider uppercase
              "
              >
                {t.hr.common.roles()}
              </TableHead>
              <TableHead className="
                py-4 text-xs font-bold tracking-wider uppercase
              "
              >
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
                className="
                  border-border/40
                  hover:bg-primary/5
                  transition-colors
                "
              >
                <TableCell className="py-4">
                  {row.error
                    ? (
                        <div className="
                          bg-destructive/10 text-destructive flex h-7 w-7
                          items-center justify-center rounded-full
                        "
                        >
                          <IconAlertCircle className="h-4 w-4" />
                        </div>
                      )
                    : (
                        <div className="
                          bg-success/10 text-success flex h-7 w-7 items-center
                          justify-center rounded-full
                        "
                        >
                          <IconCircleCheck className="h-4 w-4" />
                        </div>
                      )}
                </TableCell>
                <TableCell className="text-foreground py-4 font-semibold">
                  {row.name}
                </TableCell>
                <TableCell className="text-muted-foreground py-4 font-medium">
                  <div className="flex items-center gap-1.5">
                    <IconMail className="h-3 w-3" />
                    {row.email}
                  </div>
                </TableCell>
                <TableCell className="
                  text-muted-foreground py-4 whitespace-nowrap
                "
                >
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
                    <IconShield className="text-primary/60 h-3 w-3" />
                    <span className="text-foreground font-medium">{row.roles}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {row.error && (
                    <div className="
                      text-destructive flex items-center gap-1.5 text-xs
                      font-bold tracking-tight uppercase
                    "
                    >
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

      <div className="flex items-center justify-end gap-4">
        <Button
          variant="ghost"
          className="
            bg-muted
            hover:bg-muted/80
            rounded-xl px-6 font-medium transition-colors
          "
          onClick={reset}
        >
          {t.common.cancel()}
        </Button>
        <Button
          onClick={handleImport}
          disabled={isProcessing || preview.filter(r => !r.error).length === 0}
          className="
            shadow-primary/20 min-w-[160px] rounded-xl px-8 font-bold shadow-lg
            transition-all
            hover:scale-[1.02]
            active:scale-[0.98]
          "
        >
          {isProcessing
            ? (
                <>
                  <IconLoader2 className="
                    text-primary-foreground/80 mr-2 h-4 w-4 animate-spin
                  "
                  />
                  {t.hr.users.importing()}
                </>
              )
            : (
                <>
                  <IconUpload className="
                    mr-2 h-4 w-4
                    group-hover:-translate-y-0.5
                  "
                  />
                  {t.hr.users.importUsers()}
                </>
              )}
        </Button>
      </div>
    </motion.div>
  )
}
