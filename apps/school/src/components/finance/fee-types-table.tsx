import { IconDots, IconEdit, IconTag, IconTrash } from '@tabler/icons-react'
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
import { generateUUID } from '@/utils/generateUUID'

interface FeeType {
  id: string
  code: string
  name: string
  category: string
  isMandatory: boolean
  isRecurring: boolean
  status: string
}

interface FeeTypesTableProps {
  feeTypes: FeeType[]
  isPending?: boolean
  onEdit?: (feeType: FeeType) => void
  onDelete?: (feeType: FeeType) => void
}

export function FeeTypesTable({
  feeTypes,
  isPending = false,
  onEdit,
  onDelete,
}: FeeTypesTableProps) {
  const t = useTranslations()

  const getCategoryLabel = (category: string) => {
    const categoryTranslations = {
      tuition: t.finance.feeCategories.tuition,
      registration: t.finance.feeCategories.registration,
      exam: t.finance.feeCategories.exam,
      transport: t.finance.feeCategories.transport,
      uniform: t.finance.feeCategories.uniform,
      books: t.finance.feeCategories.books,
      meals: t.finance.feeCategories.meals,
      activities: t.finance.feeCategories.activities,
      other: t.finance.feeCategories.other,
    }
    return (
      categoryTranslations[category as keyof typeof categoryTranslations]?.()
      || category
    )
  }

  if (isPending) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (feeTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-xl bg-card/10 m-4">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <IconTag className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">{t.finance.feeTypes.noFeeTypes()}</p>
        <p className="text-sm max-w-sm mt-1">
          {t.finance.feeTypes.description()}
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
                {t.finance.feeTypes.code()}
              </TableHead>
              <TableHead className="font-semibold">{t.common.name()}</TableHead>
              <TableHead className="font-semibold">
                {t.finance.feeTypes.category()}
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
              {feeTypes.map((feeType, index) => (
                <motion.tr
                  key={feeType.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-muted/30 border-border/40 transition-colors"
                >
                  <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                    {feeType.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-bold text-foreground">
                        {feeType.name}
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {feeType.isMandatory && (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold tracking-wider bg-red-500/5 text-red-600 border-red-200 dark:border-red-900/30"
                          >
                            Obligatoire
                          </Badge>
                        )}
                        {feeType.isRecurring && (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/5 text-blue-600 border-blue-200 dark:border-blue-900/30"
                          >
                            Récurrent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-secondary/50 font-medium"
                    >
                      {getCategoryLabel(feeType.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        feeType.status === 'active' ? 'default' : 'secondary'
                      }
                      className="rounded-md"
                    >
                      {feeType.status === 'active'
                        ? t.common.active()
                        : t.common.inactive()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={(
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                            }}
                          >
                            <IconDots className="h-4 w-4" />
                          </Button>
                        )}
                      />
                      <DropdownMenuContent
                        align="end"
                        className="w-48 backdrop-blur-xl bg-card/95 border-border/40 shadow-xl rounded-xl p-1"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit?.(feeType)}
                          className="rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary font-medium"
                        >
                          <IconEdit className="mr-2 h-4 w-4" />
                          {t.common.edit()}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(feeType)}
                          className="text-destructive rounded-lg cursor-pointer focus:bg-destructive/10 focus:text-destructive font-medium"
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
          {feeTypes.map((feeType, index) => (
            <motion.div
              key={feeType.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-md space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-lg">{feeType.name}</div>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">
                    {feeType.code}
                  </div>
                </div>
                <Badge
                  variant={
                    feeType.status === 'active' ? 'default' : 'secondary'
                  }
                  className="rounded-md"
                >
                  {feeType.status === 'active'
                    ? t.common.active()
                    : t.common.inactive()}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-secondary/50 font-medium"
                >
                  {getCategoryLabel(feeType.category)}
                </Badge>
                {feeType.isMandatory && (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-bold tracking-wider bg-red-500/5 text-red-600 border-red-200 dark:border-red-900/30"
                  >
                    Obligatoire
                  </Badge>
                )}
                {feeType.isRecurring && (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/5 text-blue-600 border-blue-200 dark:border-blue-900/30"
                  >
                    Récurrent
                  </Badge>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-lg"
                  onClick={() => onEdit?.(feeType)}
                >
                  <IconEdit className="mr-2 h-3.5 w-3.5" />
                  {t.common.edit()}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete?.(feeType)}
                >
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
