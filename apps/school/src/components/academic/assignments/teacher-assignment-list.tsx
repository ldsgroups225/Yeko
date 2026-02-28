import {
  IconAdjustmentsHorizontal,
  IconBook,
  IconDownload,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { useTranslations } from '@/i18n'
import { teacherOptions } from '@/lib/queries/teachers'
import { TeacherAssignmentDialog } from './teacher-assignment-dialog'

export function TeacherAssignmentList() {
  const t = useTranslations()
  const [search, setSearch] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<{
    id: string
    name: string
  } | null>(null)

  const { data: result, isPending } = useQuery(teacherOptions.list({ search }))

  const teachers = result ? (result.teachers || []) : []

  if (isPending) {
    return <TableSkeleton columns={4} rows={5} />
  }

  const hasNoData = teachers.length === 0

  return (
    <div className="space-y-6">
      {/* Filters & Actions - Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          border-border/40 bg-card/50 flex flex-col gap-4 rounded-xl border p-4
          backdrop-blur-xl
          sm:flex-row sm:items-center sm:justify-between
        "
      >
        <div className="flex flex-1 gap-3">
          <div className="relative max-w-sm flex-1">
            <IconSearch className="
              text-muted-foreground absolute top-1/2 left-3 h-4 w-4
              -translate-y-1/2
            "
            />
            <Input
              placeholder={t.academic.assignments.searchPlaceholder()}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="
                border-border/40 bg-card/50
                focus:bg-card/80
                pl-9 shadow-none transition-all
              "
            />
          </div>

          <Popover>
            <PopoverTrigger
              render={(
                <Button
                  variant="outline"
                  className="
                    border-border/40 bg-card/50
                    hover:bg-card/80
                    shadow-none backdrop-blur-sm
                  "
                >
                  <IconAdjustmentsHorizontal className="mr-2 h-4 w-4" />
                  {t.common.actions()}
                </Button>
              )}
            />
            <PopoverContent
              className="
                bg-popover/90 border-border/40 w-80 space-y-4 border p-4
                backdrop-blur-2xl
              "
              align="start"
            >
              <div className="space-y-2 pt-2">
                <h4 className="
                  text-muted-foreground mb-3 text-xs leading-none font-medium
                  tracking-wider uppercase
                "
                >
                  {t.common.quickActions()}
                </h4>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => toast.info(t.common.comingSoon())}
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  {t.common.export()}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </motion.div>

      <div className="
        border-border/40 bg-card/40 overflow-hidden rounded-xl border
        backdrop-blur-xl
      "
      >
        {hasNoData
          ? (
              <div className="
                flex flex-col items-center justify-center py-24 text-center
              "
              >
                <div className="
                  mb-4 rounded-full bg-white/10 p-6 backdrop-blur-xl
                "
                >
                  <IconBook className="text-muted-foreground/50 h-12 w-12" />
                </div>
                <h3 className="text-lg font-semibold">
                  {t.academic.assignments.noTeachers()}
                </h3>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                  {search
                    ? t.academic.assignments.adjustSearch()
                    : t.academic.assignments.noTeachersForAssignment()}
                </p>
              </div>
            )
          : (
              <Table>
                <TableHeader className="bg-card/20">
                  <TableRow className="
                    border-border/40
                    hover:bg-transparent
                  "
                  >
                    <TableHead className="text-foreground font-semibold">
                      {t.academic.assignments.teacher()}
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      {t.academic.assignments.specialization()}
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      {t.academic.assignments.assignedSubjects()}
                    </TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {teachers.map((teacher, index) => (
                      <motion.tr
                        key={teacher.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.02 }}
                        className="
                          border-border/10 group
                          hover:bg-card/30
                          transition-colors
                        "
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="
                              border-border/20 h-10 w-10 border
                            "
                            >
                              <AvatarImage
                                src={teacher.user.avatarUrl || undefined}
                              />
                              <AvatarFallback>
                                {teacher.user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-foreground font-medium">
                                {teacher.user.name}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {teacher.user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {teacher.specialization
                            ? (
                                <Badge
                                  variant="outline"
                                  className="
                                    bg-primary/5 border-primary/20
                                    text-foreground text-[10px] font-semibold
                                    tracking-wider uppercase
                                  "
                                >
                                  {teacher.specialization}
                                </Badge>
                              )
                            : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {teacher.subjects?.length > 0
                              ? (
                                  teacher.subjects.slice(0, 3).map((sub: string) => (
                                    <Badge
                                      key={`${teacher.id}-${sub}`}
                                      variant="secondary"
                                      className="
                                        bg-primary/10 text-primary
                                        border-primary/20
                                        hover:bg-primary/20
                                        text-[10px] font-bold tracking-wider
                                        uppercase shadow-none transition-colors
                                      "
                                    >
                                      {sub}
                                    </Badge>
                                  ))
                                )
                              : (
                                  <span className="
                                    text-muted-foreground text-[10px]
                                    font-medium tracking-wider uppercase italic
                                    opacity-60
                                  "
                                  >
                                    {t.academic.assignments.noSubjectsAssigned()}
                                  </span>
                                )}
                            {teacher.subjects?.length > 3 && (
                              <Badge
                                variant="outline"
                                className="
                                  bg-muted/20 border-border/40
                                  hover:bg-muted/30
                                  text-[10px] font-bold transition-colors
                                "
                              >
                                +
                                {teacher.subjects.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="
                              hover:bg-primary/10 hover:text-primary
                              transition-colors
                            "
                            onClick={() =>
                              setSelectedTeacher({
                                id: teacher.id,
                                name: teacher.user.name,
                              })}
                          >
                            <IconPlus className="mr-2 h-3 w-3" />
                            {t.academic.assignments.assign()}
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
      </div>

      {selectedTeacher && (
        <TeacherAssignmentDialog
          open={!!selectedTeacher}
          onOpenChange={open => !open && setSelectedTeacher(null)}
          teacherId={selectedTeacher.id}
          teacherName={selectedTeacher.name}
        />
      )}
    </div>
  )
}
