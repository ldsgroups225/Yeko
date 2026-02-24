import { IconCircleCheck, IconCircleX, IconClipboardCheck, IconDots, IconFileText, IconUser } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
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
import { AnimatePresence, motion } from 'motion/react'
import { generateUUID } from '@/utils/generateUUID'

interface GradingValidationsTableProps {
  isPending: boolean
  filteredValidations: any[]
  selectedRows: string[]
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: string, checked: boolean) => void
  onValidate: (validation: any) => void
  onReject: (validation: any) => void
  onViewDetails: (validation: any) => void
  t: any
}

export function GradingValidationsTable({
  isPending,
  filteredValidations,
  selectedRows,
  onSelectAll,
  onSelectRow,
  onValidate,
  onReject,
  onViewDetails,
  t,
}: GradingValidationsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-3xl border border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl"
    >
      <Table>
        <TableHeader className="bg-muted/20">
          <TableRow className="hover:bg-transparent border-border/20">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={
                  filteredValidations.length > 0
                  && selectedRows.length === filteredValidations.length
                }
                onCheckedChange={checked => onSelectAll(!!checked)}
                className="border-primary/50 data-[state=checked]:border-primary"
              />
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">
              {t.academic.grades.entry.title()}
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">
              {t.academic.grades.entry.subject()}
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">
              {t.academic.grades.validations.submittedBy()}
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">
              Moyenne
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5 text-center truncate">
              NB. ÉLÈVES
            </TableHead>
            <TableHead className="w-[100px] pr-6" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending
            ? (
                Array.from({ length: 5 }).map(() => (
                  <TableRow key={generateUUID()} className="border-border/10">
                    <TableCell className="pl-6">
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-32 rounded-lg" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-40 rounded-lg" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-32 rounded-lg" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-lg" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-lg" />
                    </TableCell>
                    <TableCell className="pr-6">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              )
            : filteredValidations.length > 0
              ? (
                  <AnimatePresence mode="popLayout">
                    {filteredValidations.map((validation, index) => {
                      const rowId = `${validation.classId}__${validation.subjectId}__${validation.termId}`
                      return (
                        <motion.tr
                          key={rowId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-border/10 group hover:bg-primary/5 transition-colors"
                        >
                          <TableCell className="pl-6">
                            <Checkbox
                              checked={selectedRows.includes(rowId)}
                              onCheckedChange={checked => onSelectRow(rowId, !!checked)}
                              className="border-primary/50 data-[state=checked]:border-primary"
                            />
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <IconFileText className="size-4" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold tracking-tight">
                                  {validation.gradeName}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="rounded-full bg-background/50 border-border/40 font-bold uppercase tracking-wider text-[10px] w-6 h-6 flex items-center justify-center p-0"
                                >
                                  {validation.className}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-muted-foreground italic">
                            {validation.subjectName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-linear-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                                <IconUser className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm font-medium">
                                {validation.teacherName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-start gap-1">
                              <span className="font-bold text-sm">
                                {validation.average}
                                <span className="text-muted-foreground text-xs font-normal ml-0.5">
                                  /
                                  {validation.maxGrade}
                                </span>
                              </span>
                              <Badge variant="secondary" className="w-fit text-[10px] px-1.5 h-5 font-medium">
                                Coef.
                                {' '}
                                {validation.coefficient}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-accent/10 text-accent-foreground hover:bg-accent/20 border-accent/20 font-black px-2.5 rounded-full">
                              {validation.pendingCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={(
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-background/80 ml-auto flex rounded-xl"
                                  >
                                    <IconDots className="size-4" />
                                  </Button>
                                )}
                              />
                              <DropdownMenuContent
                                align="end"
                                className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40 min-w-[160px]"
                              >
                                <DropdownMenuItem
                                  onClick={() => onValidate(validation)}
                                  className="rounded-lg py-2 cursor-pointer"
                                >
                                  <IconCircleCheck className="mr-2 size-4 text-success" />
                                  <span className="font-semibold">
                                    {t.academic.grades.validations.validate()}
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onReject(validation)}
                                  className="rounded-lg py-2 cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <IconCircleX className="mr-2 size-4" />
                                  <span className="font-semibold">
                                    {t.academic.grades.validations.reject()}
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onViewDetails(validation)}
                                  className="rounded-lg py-2 cursor-pointer border-t border-border/10 mt-1"
                                >
                                  <IconFileText className="mr-2 size-4" />
                                  <span className="font-semibold">
                                    {t.academic.grades.validations.viewDetails()}
                                  </span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                )
              : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40 italic">
                        <IconClipboardCheck className="size-12 mb-4" />
                        <p className="text-lg font-bold">
                          {t.academic.grades.validations.noValidations()}
                        </p>
                        <p className="text-sm font-medium">
                          {t.academic.grades.validations.allValidated()}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
        </TableBody>
      </Table>
    </motion.div>
  )
}
