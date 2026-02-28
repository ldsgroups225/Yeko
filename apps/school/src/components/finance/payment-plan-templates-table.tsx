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
      <div className="
        text-muted-foreground border-border/30 bg-card/10 m-4 flex flex-col
        items-center justify-center rounded-xl border-2 border-dashed py-16
        text-center
      "
      >
        <div className="bg-muted/20 mb-4 rounded-full p-4">
          <IconFileText className="text-muted-foreground/50 h-8 w-8" />
        </div>
        <p className="text-lg font-medium">{t.finance.paymentPlanTemplates.noTemplates()}</p>
        <p className="text-muted-foreground/70 mt-1 max-w-sm text-sm">
          {t.finance.paymentPlanTemplates.description()}
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
                  className="
                    group
                    hover:bg-muted/30
                    border-border/40 transition-colors
                  "
                >
                  <TableCell className="flex items-center gap-2 font-bold">
                    {template.name}
                    {template.isDefault && (
                      <Badge
                        variant="secondary"
                        className="h-4 px-1.5 py-0 text-[10px]"
                      >
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
                        'border font-medium',
                        template.status === 'active'
                          ? `
                            border-green-200 bg-green-500/10 text-green-700
                            dark:border-green-900/30 dark:text-green-400
                          `
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
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(template)
                          }}
                          className="
                            focus:bg-primary/10
                            cursor-pointer rounded-lg font-medium
                          "
                        >
                          <IconEdit className="
                            text-muted-foreground mr-2 h-4 w-4
                          "
                          />
                          {t.common.edit()}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.(template)
                          }}
                          className="
                            text-destructive
                            focus:bg-destructive/10 focus:text-destructive
                            cursor-pointer rounded-lg font-medium
                          "
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

      <div className="
        space-y-4 p-4
        md:hidden
      "
      >
        <AnimatePresence>
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="
                border-border/40 bg-card/50 space-y-3 rounded-2xl border p-4
                backdrop-blur-md
              "
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-lg font-bold">
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
                        className="-mt-2 -mr-2 h-8 w-8 rounded-lg"
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
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit?.(template)
                      }}
                      className="
                        focus:bg-primary/10
                        cursor-pointer rounded-lg font-medium
                      "
                    >
                      <IconEdit className="text-muted-foreground mr-2 h-4 w-4" />
                      {t.common.edit()}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/40" />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete?.(template)
                      }}
                      className="
                        text-destructive
                        focus:bg-destructive/10 focus:text-destructive
                        cursor-pointer rounded-lg font-medium
                      "
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      {t.common.delete()}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="
                border-border/30 flex items-center justify-between border-t pt-2
              "
              >
                <span className="text-muted-foreground text-sm">
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
