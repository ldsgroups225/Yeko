import { IconAlertTriangle, IconLoader2, IconUserPlus } from '@tabler/icons-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { GradeStatisticsCard } from '../grade-statistics-card'
import { useGradeEntry } from './grade-entry-context'

export function GradeEntryHeader() {
  const t = useTranslations()
  const { state, actions } = useGradeEntry()
  const { statistics, isMissingTeacher, pendingChanges, teachers, isPendingAction } = state
  const { setPendingAssignment } = actions

  return (
    <div className="space-y-6">
      <GradeStatisticsCard statistics={statistics} />

      {isMissingTeacher && pendingChanges.size > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="
            bg-destructive/10 border-destructive/20 text-destructive flex
            flex-wrap items-center gap-4 rounded-2xl border p-4
          "
        >
          <div className="flex min-w-[200px] flex-1 items-center gap-3">
            <IconAlertTriangle className="size-5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">{t.academic.grades.errors.noTeacherTitle()}</p>
              <p className="text-xs font-medium opacity-80">
                {t.academic.grades.errors.noTeacherDescription()}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <Select
              disabled={isPendingAction}
              onValueChange={(val) => {
                const teacherId = val as string
                const teacher = teachers.find(t => t.id === teacherId)
                if (teacher) {
                  setPendingAssignment({
                    teacherId,
                    teacherName: teacher.user.name,
                  })
                }
              }}
            >
              <SelectTrigger className="
                bg-destructive/10 border-destructive/20 ring-offset-background
                focus:ring-destructive/30
                h-9 min-w-[200px] text-xs font-bold
              "
              >
                <div className="flex items-center gap-2">
                  {isPendingAction
                    ? (
                        <IconLoader2 className="size-3 animate-spin" />
                      )
                    : (
                        <IconUserPlus className="size-3" />
                      )}
                  <SelectValue placeholder={t.academic.grades.assignment.quickAssign()} />
                </div>
              </SelectTrigger>
              <SelectContent className="
                bg-card/95 border-border/40 backdrop-blur-xl
              "
              >
                {teachers.map(teacher => (
                  <SelectItem
                    key={teacher.id}
                    value={teacher.id}
                    className="
                      focus:bg-primary/5 focus:text-primary
                      text-xs font-medium
                    "
                  >
                    {teacher.user.name}
                  </SelectItem>
                ))}
                {teachers.length === 0 && (
                  <div className="
                    text-muted-foreground p-2 text-center text-xs italic
                  "
                  >
                    {t.common.noResults()}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}
    </div>
  )
}
