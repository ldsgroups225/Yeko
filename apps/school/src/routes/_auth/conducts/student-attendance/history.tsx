import { IconArrowLeft, IconSearch } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { AttendanceCalendar } from '@/components/attendance/student/attendance-calendar'
import { StudentCombobox } from '@/components/attendance/student/student-combobox'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { studentAttendanceHistoryOptions } from '@/lib/queries/student-attendance'

export const Route = createFileRoute('/_auth/conducts/student-attendance/history')({
  component: StudentAttendanceHistoryPage,
})

function StudentAttendanceHistoryPage() {
  const t = useTranslations()
  const [studentId, setStudentId] = useState('')
  const [studentName, setStudentName] = useState('')
  const [studentPhoto, setStudentPhoto] = useState<string | undefined>()
  const [month, setMonth] = useState(() => new Date())

  const startDate = new Date(month.getFullYear(), month.getMonth(), 1)
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0)

  const { data, isPending } = useQuery({
    ...studentAttendanceHistoryOptions({
      studentId,
      startDate: startDate.toISOString().split('T')[0] ?? '',
      endDate: endDate.toISOString().split('T')[0] ?? '',
    }),
    enabled: !!studentId,
  })

  const attendanceData = data?.map(record => ({
    date: record.date,
    status: record.status,
  })) ?? []

  const handleStudentSelect = (id: string, name: string, image?: string) => {
    setStudentId(id)
    setStudentName(name)
    setStudentPhoto(image)
  }

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.schoolLife(), href: '/conducts' },
          { label: t.schoolLife.studentAttendance(), href: '/conducts/student-attendance' },
          { label: t.attendance.history() },
        ]}
      />

      <div className="
        flex flex-col justify-between gap-6
        md:flex-row md:items-end
      "
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >

          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.attendance.history()}</h1>
            <p className="
              text-muted-foreground max-w-md text-sm font-medium italic
            "
            >
              {t.attendance.historyDescription()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/conducts/student-attendance">
            <Button
              variant="ghost"
              size="sm"
              className="
                hover:bg-primary/10 hover:text-primary
                rounded-xl text-[10px] font-black tracking-widest uppercase
                transition-all
              "
            >
              <IconArrowLeft className="mr-2 h-4 w-4" />
              {t.common.back()}
            </Button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          bg-card/20 border-border/40 rounded-3xl border p-6 backdrop-blur-xl
        "
      >
        <div className="mb-4 ml-1 flex items-center gap-2">
          <IconSearch className="text-muted-foreground/60 size-3" />
          <span className="
            text-muted-foreground/60 text-[10px] font-black tracking-widest
            uppercase
          "
          >
            {t.attendance.selectStudent()}
          </span>
        </div>
        <StudentCombobox
          value={studentId}
          onSelect={handleStudentSelect}
          placeholder={t.attendance.searchStudent()}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {studentId
          ? (
              <motion.div
                key={studentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-center"
              >
                {isPending
                  ? (
                      <Card className="
                        border-border/40 bg-card/30 w-full max-w-2xl rounded-3xl
                        p-8 shadow-2xl backdrop-blur-xl
                      "
                      >
                        <Skeleton className="h-[400px] w-full rounded-2xl" />
                      </Card>
                    )
                  : (
                      <div className="w-full max-w-2xl">
                        <AttendanceCalendar
                          studentName={studentName || studentId}
                          studentPhoto={studentPhoto}
                          month={month}
                          onMonthChange={setMonth}
                          attendanceData={attendanceData}
                        />
                      </div>
                    )}
              </motion.div>
            )
          : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="
                  border-primary/20 bg-primary/5 flex flex-col items-center
                  space-y-6 rounded-[2.5rem] border border-dashed p-20
                  text-center
                "
              >

                <div className="space-y-2">
                  <h3 className="
                    text-primary/60 text-2xl font-black tracking-tight uppercase
                    italic
                  "
                  >
                    {t.attendance.searchStudent()}
                  </h3>
                  <p className="
                    text-muted-foreground/40 max-w-xs text-base font-medium
                    italic
                  "
                  >
                    {t.attendance.selectStudent()}
                  </p>
                </div>
              </motion.div>
            )}
      </AnimatePresence>
    </div>
  )
}
