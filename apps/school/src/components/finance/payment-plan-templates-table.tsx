import {
  IconDots,
  IconEdit,
  IconFileText,
  IconTrash,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

export interface PaymentPlanTemplateTableItem {
  id: string
  name: string
  nameEn?: string | null
  installmentsCount: number
  isDefault: boolean
  status: 'active' | 'inactive'
  schedule: {
    number: number
    percentage: number
    dueDaysFromStart: number
    label: string
  }[]
}

interface PaymentPlanTemplatesTableProps {
  templates: PaymentPlanTemplateTableItem[]
  isPending?: boolean
  onEdit?: (template: PaymentPlanTemplateTableItem) => void
  onDelete?: (template: PaymentPlanTemplateTableItem) => void
}

export function PaymentPlanTemplatesTable({
  templates,
  isPending = false,
  onEdit,
  onDelete,
}: PaymentPlanTemplatesTableProps) {
  const t = useTranslations()

  if (isPending) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-xl bg-card/10 m-4">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <IconFileText className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">{t.finance.paymentPlanTemplates.noTemplates()}</p>
        <p className="text-sm max-w-sm mt-1 text-muted-foreground/70">
          {t.finance.paymentPlanTemplates.description()}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="font-semibold">
                {t.common.name()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.finance.paymentPlanTemplates.installmentsCount()}
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
              {templates.map((template, index) => (
                <motion.tr
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-muted/30 border-border/40 transition-colors"
                >
                  <TableCell className="font-bold flex items-center gap-2">
                    {template.name}
                    {template.isDefault && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                        {t.finance.paymentPlanTemplates.isDefault()}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {template.installmentsCount}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-medium border',
                        template.status === 'active'
                          ? 'bg-green-500/10 text-green-700 border-green-200 dark:border-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground border-border',
                      )}
                    >
                      {template.status === 'active' ? t.finance.paymentPlans.status.active() : t.common.inactive()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={(
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IconDots className="h-4 w-4" />
                          </Button>
                        )}
                      />
                      <DropdownMenuContent
                        align="end"
                        className="backdrop-blur-xl bg-card/95 border-border/40 shadow-xl rounded-xl p-1"
                      >
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(template)
                          }}
                          className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
                        >
                          <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
                          {t.common.edit()}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.(template)
                          }}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          {t.common.delete()}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4 p-4">
        <AnimatePresence>
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl border border-border/40 backdrop-blur-md bg-card/50 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="font-bold text-lg flex items-center gap-2">
                  {template.name}
                  {template.isDefault && (
                    <Badge variant="secondary" className="text-[10px]">
                      {t.finance.paymentPlanTemplates.isDefault()}
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={(
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg -mr-2 -mt-2"
                      >
                        <IconDots className="h-4 w-4" />
                      </Button>
                    )}
                  />
                  <DropdownMenuContent
                    align="end"
                    className="backdrop-blur-xl bg-card/95 border-border/40 shadow-xl rounded-xl p-1"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit?.(template)
                      }}
                      className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
                    >
                      <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
                      {t.common.edit()}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/40" />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete?.(template)
                      }}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      {t.common.delete()}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/30">
                <span className="text-sm text-muted-foreground">
                  {t.finance.paymentPlanTemplates.installmentsCount()}
                </span>
                <span className="font-bold">{template.installmentsCount}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
