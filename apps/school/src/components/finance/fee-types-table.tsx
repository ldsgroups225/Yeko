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
      <div className="
        text-muted-foreground border-border/30 bg-card/10 m-4 flex flex-col
        items-center justify-center rounded-xl border-2 border-dashed py-16
        text-center
      "
      >
        <div className="bg-muted/20 mb-4 rounded-full p-4">
          <IconTag className="text-muted-foreground/50 h-8 w-8" />
        </div>
        <p className="text-lg font-medium">{t.finance.feeTypes.noFeeTypes()}</p>
        <p className="mt-1 max-w-sm text-sm">
          {t.finance.feeTypes.description()}
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
                  className="
                    group
                    hover:bg-muted/30
                    border-border/40 transition-colors
                  "
                >
                  <TableCell className="
                    text-muted-foreground font-mono text-sm font-medium
                  "
                  >
                    {feeType.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-foreground font-bold">
                        {feeType.name}
                      </div>
                      <div className="mt-1.5 flex gap-1">
                        {feeType.isMandatory && (
                          <Badge
                            variant="outline"
                            className="
                              bg-destructive/5 text-destructive
                              border-destructive/20 text-[10px] font-bold
                              tracking-wider uppercase
                            "
                          >
                            Obligatoire
                          </Badge>
                        )}
                        {feeType.isRecurring && (
                          <Badge
                            variant="outline"
                            className="
                              bg-secondary/5 text-secondary border-secondary/20
                              text-[10px] font-bold tracking-wider uppercase
                            "
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
                            className="
                              hover:bg-muted
                              h-8 w-8 rounded-lg
                            "
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
                        className="
                          bg-card/95 border-border/40 w-48 rounded-xl p-1
                          shadow-xl backdrop-blur-xl
                        "
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit?.(feeType)}
                          className="
                            focus:bg-primary/10 focus:text-primary
                            cursor-pointer rounded-lg font-medium
                          "
                        >
                          <IconEdit className="mr-2 h-4 w-4" />
                          {t.common.edit()}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(feeType)}
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
          {feeTypes.map((feeType, index) => (
            <motion.div
              key={feeType.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="
                bg-card/50 border-border/40 space-y-3 rounded-2xl border p-4
                backdrop-blur-md
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold">{feeType.name}</div>
                  <div className="
                    text-muted-foreground mt-0.5 font-mono text-xs
                  "
                  >
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
                    className="
                      bg-destructive/5 text-destructive border-destructive/20
                      text-[10px] font-bold tracking-wider uppercase
                    "
                  >
                    Obligatoire
                  </Badge>
                )}
                {feeType.isRecurring && (
                  <Badge
                    variant="outline"
                    className="
                      bg-secondary/5 text-secondary border-secondary/20
                      text-[10px] font-bold tracking-wider uppercase
                    "
                  >
                    Récurrent
                  </Badge>
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
                  onClick={() => onEdit?.(feeType)}
                >
                  <IconEdit className="mr-2 h-3.5 w-3.5" />
                  {t.common.edit()}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="
                    text-destructive
                    hover:text-destructive hover:bg-destructive/10
                    h-8 rounded-lg
                  "
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
