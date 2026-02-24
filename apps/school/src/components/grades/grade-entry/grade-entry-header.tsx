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
          className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center flex-wrap gap-4 text-destructive"
        >
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <IconAlertTriangle className="size-5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">{t.academic.grades.errors.noTeacherTitle()}</p>
              <p className="text-xs opacity-80 font-medium">
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
              <SelectTrigger className="bg-destructive/10 border-destructive/20 h-9 min-w-[200px] text-xs font-bold ring-offset-background focus:ring-destructive/30">
                <div className="flex items-center gap-2">
                  {isPendingAction ? <IconLoader2 className="size-3 animate-spin" /> : <IconUserPlus className="size-3" />}
                  <SelectValue placeholder={t.academic.grades.assignment.quickAssign()} />
                </div>
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-card/95 border-border/40">
                {teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id} className="text-xs font-medium focus:bg-primary/5 focus:text-primary">
                    {teacher.user.name}
                  </SelectItem>
                ))}
                {teachers.length === 0 && (
                  <div className="p-2 text-center text-xs text-muted-foreground italic">
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
