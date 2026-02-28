import { IconAlertTriangle, IconPlus, IconX } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { TableCell } from '@workspace/ui/components/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { useAssignmentMatrix } from './assignment-matrix-context'

interface AssignmentMatrixCellProps {
  classId: string
  className: string
  subjectId: string
  subjectName: string
}

export function AssignmentMatrixCell({
  classId,
  className,
  subjectId,
  subjectName,
}: AssignmentMatrixCellProps) {
  const t = useTranslations()
  const { state, actions } = useAssignmentMatrix()
  const { editingCell, assignmentMap, teachers } = state
  const { setEditingCell, assignTeacher, removeTeacher, isTeacherOverloaded } = actions

  const key = `${classId}-${subjectId}`
  const assignment = assignmentMap.get(key)
  const isEditing = editingCell?.classId === classId && editingCell?.subjectId === subjectId
  const teacherOverloaded = assignment?.teacherId ? isTeacherOverloaded(assignment.teacherId) : false

  return (
    <TableCell className="relative p-2 text-center">
      <AnimatePresence mode="wait">
        {isEditing
          ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-center gap-1"
              >
                <Select
                  onValueChange={(val) => {
                    if (val === 'none') {
                      removeTeacher({ classId, subjectId })
                    }
                    else if (val) {
                      assignTeacher({ classId, subjectId, teacherId: val })
                    }
                  }}
                  defaultValue={assignment?.teacherId || 'none'}
                >
                  <SelectTrigger
                    className="
                      border-border/10
                      focus:ring-primary/40
                      h-9 w-[150px] bg-white/5 text-xs
                    "
                    aria-label={`${t.assignmentMatrix.selectTeacherFor()} ${className} - ${subjectName}`}
                  >
                    <SelectValue placeholder={t.common.select()} />
                  </SelectTrigger>
                  <SelectContent className="
                    bg-card/95 border-border/10 backdrop-blur-xl
                  "
                  >
                    <SelectItem value="none" className="text-xs">
                      {t.assignmentMatrix.notAssigned()}
                    </SelectItem>
                    {teachers.map((teacher) => {
                      const overloaded = isTeacherOverloaded(teacher.id)
                      return (
                        <SelectItem
                          key={teacher.id}
                          value={teacher.id}
                          className="text-xs"
                        >
                          <span className="flex items-center gap-2">
                            {teacher.user.name}
                            {overloaded && (
                              <Badge
                                variant="destructive"
                                className="
                                  bg-destructive/10 text-destructive h-4
                                  border-0 px-1 text-[8px]
                                "
                              >
                                OVERLOAD
                              </Badge>
                            )}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="
                    h-8 w-8
                    hover:bg-white/10
                  "
                  onClick={() => setEditingCell(null)}
                  aria-label={t.common.cancel()}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </motion.div>
            )
          : (
              <motion.div key={`static-${key}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={(
                        <Button
                          variant={assignment?.teacherId ? 'secondary' : 'ghost'}
                          size="sm"
                          className={cn(
                            `
                              h-9 w-full min-w-[130px] rounded-lg border
                              transition-all
                            `,
                            assignment?.teacherId
                              ? `
                                bg-primary/5
                                hover:bg-primary/10
                                text-primary border-primary/20
                              `
                              : `
                                text-muted-foreground border-border/20
                                hover:border-primary/40
                                border-dashed
                                hover:bg-white/5
                              `,
                          )}
                          onClick={() => setEditingCell({ classId, subjectId })}
                        >
                          {assignment?.teacherId
                            ? (
                                <div className="
                                  flex items-center gap-1.5 truncate
                                "
                                >
                                  <span className="truncate">{assignment.teacherName}</span>
                                  {teacherOverloaded && (
                                    <IconAlertTriangle className="
                                      text-accent h-3.5 w-3.5 shrink-0
                                      animate-pulse
                                    "
                                    />
                                  )}
                                </div>
                              )
                            : (
                                <IconPlus className="
                                  h-3.5 w-3.5 opacity-40 transition-opacity
                                  group-hover:opacity-100
                                "
                                />
                              )}
                        </Button>
                      )}
                    />
                    <TooltipContent className="
                      bg-card/95 border-border/10 text-[11px] backdrop-blur-xl
                    "
                    >
                      {assignment?.teacherId
                        ? (
                            <div className="space-y-1">
                              <p className="font-semibold">{assignment.teacherName}</p>
                              {teacherOverloaded && (
                                <p className="
                                  text-accent flex items-center gap-1
                                "
                                >
                                  <IconAlertTriangle className="h-3 w-3" />
                                  {t.assignmentMatrix.overloaded()}
                                </p>
                              )}
                              <p className="opacity-70">{t.common.clickToEdit()}</p>
                            </div>
                          )
                        : (
                            t.assignmentMatrix.clickToAssign()
                          )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
      </AnimatePresence>
    </TableCell>
  )
}
