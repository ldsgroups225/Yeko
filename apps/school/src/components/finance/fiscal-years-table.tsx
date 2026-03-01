import {
  IconCalendar,
  IconDots,
  IconLock,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

export interface FiscalYearsTableItem {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'open' | 'closed' | 'locked'
}

interface FiscalYearsTableProps {
  fiscalYears: FiscalYearsTableItem[]
  isPending?: boolean
  onClose?: (fiscalYear: FiscalYearsTableItem) => void
}

export function FiscalYearsTable({
  fiscalYears,
  isPending = false,
  onClose,
}: FiscalYearsTableProps) {
  const t = useTranslations()

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return t.finance.fiscalYears.status.open()
      case 'closed':
        return t.finance.fiscalYears.status.closed()
      case 'locked':
        return t.finance.fiscalYears.status.locked()
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-success/10 text-success border-success/20 dark:border-success/30 dark:text-success/80'
      case 'closed':
        return 'bg-destructive/10 text-destructive border-destructive/20 dark:border-destructive/30 dark:text-destructive/80'
      case 'locked':
        return 'bg-orange-500/10 text-orange-700 border-orange-200 dark:border-orange-900/30 dark:text-orange-400'
      default:
        return ''
    }
  }

  if (isPending) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (fiscalYears.length === 0) {
    return (
      <div className="
        text-muted-foreground border-border/30 bg-card/10 m-4 flex flex-col
        items-center justify-center rounded-xl border-2 border-dashed py-16
        text-center
      "
      >
        <div className="bg-muted/20 mb-4 rounded-full p-4">
          <IconCalendar className="text-muted-foreground/50 h-8 w-8" />
        </div>
        <p className="text-lg font-medium">{t.finance.fiscalYears.noFiscalYears()}</p>
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
                {t.finance.fiscalYears.title()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.finance.fiscalYears.startDate()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.finance.fiscalYears.endDate()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.common.status()}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t.common.actions()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {fiscalYears.map((fy, index) => (
                <motion.tr
                  key={fy.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="
                    group
                    hover:bg-muted/30
                    border-border/40 transition-colors
                  "
                >
                  <TableCell className="font-bold">
                    {fy.name}
                  </TableCell>
                  <TableCell>
                    {format(new Date(fy.startDate), 'dd MMMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(fy.endDate), 'dd MMMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'border font-medium',
                        getStatusColor(fy.status),
                      )}
                    >
                      {getStatusLabel(fy.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {fy.status === 'open' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={(
                            <Button
                              variant="ghost"
                              size="icon"
                              className="
                                h-8 w-8 rounded-lg opacity-0 transition-opacity
                                group-hover:opacity-100
                              "
                            >
                              <IconDots className="h-4 w-4" />
                            </Button>
                          )}
                        />
                        <DropdownMenuContent
                          align="end"
                          className="
                            bg-card/95 border-border/40 rounded-xl p-1 shadow-xl
                            backdrop-blur-xl
                          "
                        >
                          <DropdownMenuItem
                            onClick={() => onClose?.(fy)}
                            className="
                              focus:bg-destructive/10 focus:text-destructive
                              cursor-pointer rounded-lg font-medium
                            "
                          >
                            <IconLock className="mr-2 h-4 w-4" />
                            {t.finance.fiscalYears.close()}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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
          {fiscalYears.map((fy, index) => (
            <motion.div
              key={fy.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="
                border-border/40 bg-card/50 space-y-3 rounded-2xl border p-4
                backdrop-blur-md
              "
            >
              <div className="flex items-start justify-between">
                <div className="text-lg font-bold">{fy.name}</div>
                <Badge
                  variant="outline"
                  className={cn(
                    'border text-[10px] font-medium',
                    getStatusColor(fy.status),
                  )}
                >
                  {getStatusLabel(fy.status)}
                </Badge>
              </div>

              <div className="text-muted-foreground flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span>{t.finance.fiscalYears.startDate()}</span>
                  <span className="text-foreground font-medium">
                    {format(new Date(fy.startDate), 'dd/MM/yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.finance.fiscalYears.endDate()}</span>
                  <span className="text-foreground font-medium">
                    {format(new Date(fy.endDate), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>

              {fy.status === 'open' && (
                <div className="border-border/30 border-t pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="
                      text-destructive
                      hover:bg-destructive/10
                      h-9 w-full justify-start
                    "
                    onClick={() => onClose?.(fy)}
                  >
                    <IconLock className="mr-2 h-4 w-4" />
                    {t.finance.fiscalYears.close()}
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
