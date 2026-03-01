import type { TimetableViewMode } from '@/components/timetables'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { TimetableViewSwitcher } from '@/components/timetables'
import { useTranslations } from '@/i18n'

interface TimetableFiltersProps {
  viewMode: TimetableViewMode
  onViewModeChange: (mode: TimetableViewMode) => void
  selectedClassId: string
  onClassChange: (val: string) => void
  selectedTeacherId: string
  onTeacherChange: (val: string) => void
  selectedClassroomId: string
  onClassroomChange: (val: string) => void
  classes: any[]
  teachers: any[]
  classrooms: any[]
  classesPending: boolean
  teachersPending: boolean
  effectiveYearId: string
  contextPending?: boolean
}

export function TimetableFilters({
  viewMode,
  onViewModeChange,
  selectedClassId,
  onClassChange,
  selectedTeacherId,
  onTeacherChange,
  selectedClassroomId,
  onClassroomChange,
  classes,
  teachers,
  classrooms,
  classesPending,
  teachersPending,
  effectiveYearId,
  contextPending,
}: TimetableFiltersProps) {
  const t = useTranslations()

  return (
    <div className="flex flex-col gap-6">
      <TimetableViewSwitcher value={viewMode} onChange={onViewModeChange} />

      <div className="
        flex flex-col items-end gap-4
        sm:flex-row
      "
      >
        {/* Class selector (for class view) */}
        {viewMode === 'class' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="
              w-full space-y-1.5
              sm:w-[240px]
            "
          >
            <label className="
              text-muted-foreground/60 ml-1 text-[10px] font-black
              tracking-widest uppercase
            "
            >
              {t.classes.title()}
            </label>
            {classesPending || contextPending
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={selectedClassId}
                    onValueChange={val => onClassChange(val ?? '')}
                    disabled={!effectiveYearId}
                  >
                    <SelectTrigger className="
                      bg-background/50 border-border/40
                      focus:ring-primary/20
                      h-11 rounded-xl font-bold transition-all
                    "
                    >
                      <SelectValue placeholder={t.classes.select()}>
                        {selectedClassId
                          ? (() => {
                              const item = classes?.find(i => i.class.id === selectedClassId)
                              return item
                                ? (
                                    <div className="flex items-center gap-2">
                                      <div className="
                                        bg-primary size-2 rounded-full
                                      "
                                      />
                                      <span>
                                        {item.grade.name}
                                        {' '}
                                        {item.class.section}
                                      </span>
                                    </div>
                                  )
                                : undefined
                            })()
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="
                      bg-popover/90 border-border/40 rounded-xl backdrop-blur-xl
                    "
                    >
                      {classes?.map(item => (
                        <SelectItem
                          key={item.class.id}
                          value={item.class.id}
                          className="
                            focus:bg-primary/10
                            rounded-lg font-medium
                          "
                        >
                          {item.grade.name}
                          {' '}
                          {item.class.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </motion.div>
        )}

        {/* Teacher selector (for teacher view) */}
        {viewMode === 'teacher' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="
              w-full space-y-1.5
              sm:w-[240px]
            "
          >
            <label className="
              text-muted-foreground/60 ml-1 text-[10px] font-black
              tracking-widest uppercase
            "
            >
              {t.teachers.title()}
            </label>
            {teachersPending
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={selectedTeacherId}
                    onValueChange={val => onTeacherChange(val ?? '')}
                  >
                    <SelectTrigger className="
                      bg-background/50 border-border/40
                      focus:ring-primary/20
                      h-11 rounded-xl font-bold transition-all
                    "
                    >
                      <SelectValue placeholder={t.teachers.select()}>
                        {selectedTeacherId
                          ? (() => {
                              const teacher = teachers?.find(t => t.id === selectedTeacherId)
                              return teacher
                                ? (
                                    <div className="flex items-center gap-2">
                                      <div className="
                                        bg-success size-2 rounded-full
                                      "
                                      />
                                      <span>{teacher.user?.name}</span>
                                    </div>
                                  )
                                : undefined
                            })()
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="
                      bg-popover/90 border-border/40 rounded-xl backdrop-blur-xl
                    "
                    >
                      {teachers?.map(teacher => (
                        <SelectItem
                          key={teacher.id}
                          value={teacher.id}
                          className="
                            focus:bg-primary/10
                            rounded-lg font-medium
                          "
                        >
                          {teacher.user?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </motion.div>
        )}
        {/* Classroom selector (for classroom view) */}
        {viewMode === 'classroom' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="
              w-full space-y-1.5
              sm:w-[240px]
            "
          >
            <label className="
              text-muted-foreground/60 ml-1 text-[10px] font-black
              tracking-widest uppercase
            "
            >
              {t.spaces.title()}
            </label>
            <Select
              value={selectedClassroomId}
              onValueChange={val => onClassroomChange(val ?? '')}
            >
              <SelectTrigger className="
                bg-background/50 border-border/40
                focus:ring-primary/20
                h-11 rounded-xl font-bold transition-all
              "
              >
                <SelectValue placeholder={t.spaces.availability.title()}>
                  {selectedClassroomId
                    ? (() => {
                        const classroom = classrooms?.find(c => c.id === selectedClassroomId)
                        return classroom
                          ? (
                              <div className="flex items-center gap-2">
                                <div className="bg-primary size-2 rounded-full" />
                                <span>{classroom.name}</span>
                              </div>
                            )
                          : undefined
                      })()
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="
                bg-popover/90 border-border/40 rounded-xl backdrop-blur-xl
              "
              >
                {classrooms?.map(classroom => (
                  <SelectItem
                    key={classroom.id}
                    value={classroom.id}
                    className="
                      focus:bg-primary/10
                      rounded-lg font-medium
                    "
                  >
                    {classroom.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>
    </div>
  )
}
