import type { StudentAttendance } from '@/components/attendance/AttendanceStudentRow'
import { IconCheck } from '@tabler/icons-react'
/**
 * Attendance Page
 * Student attendance tracking during class sessions
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useMemo, useState } from 'react'
import { AttendanceFilters } from '@/components/attendance/AttendanceFilters'
import { AttendanceStudentRow } from '@/components/attendance/AttendanceStudentRow'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { attendanceKeys, attendanceMutations, classRosterQueryOptions } from '@/lib/queries/attendance'
import { teacherClassesQueryOptions } from '@/lib/queries/classes'

export const Route = createFileRoute('/_auth/app/attendance')({
  component: AttendancePage,
})

function AttendancePage() {
  const { LL } = useI18nContext()
  const { context } = useRequiredTeacherContext()
  const queryClient = useQueryClient()

  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]!,
  )

  // Query for teacher classes
  const { data: classesData } = useQuery({
    ...teacherClassesQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!context?.teacherId && !!context?.schoolYearId,
  })

  // Query for class roster
  const { data: rosterResult, isPending: isPendingRoster } = useQuery({
    ...classRosterQueryOptions({
      classId: selectedClassId,
      schoolYearId: context?.schoolYearId ?? '',
      date: selectedDate,
    }),
    enabled: Boolean(selectedClassId && context?.schoolYearId),
  })

  const rosterData = useMemo(() => rosterResult?.success ? rosterResult.roster : [], [rosterResult])

  // Derived counts using useMemo to avoid extra queries
  const counts = useMemo(() => {
    if (!rosterData || rosterData.length === 0) {
      return { total: 0, present: 0, absent: 0, late: 0, excused: 0, notMarked: 0 }
    }
    return {
      total: rosterData.length,
      present: rosterData.filter((s: StudentAttendance) => s.attendance?.status === 'present').length,
      absent: rosterData.filter((s: StudentAttendance) => s.attendance?.status === 'absent').length,
      late: rosterData.filter((s: StudentAttendance) => s.attendance?.status === 'late').length,
      excused: rosterData.filter((s: StudentAttendance) => s.attendance?.status === 'excused').length,
      notMarked: rosterData.filter((s: StudentAttendance) => !s.attendance).length,
    }
  }, [rosterData])

  // Mutation for saving individual attendance
  const saveMutation = useMutation({
    ...attendanceMutations.save,
    onMutate: async (variables) => {
      const { enrollmentId, status } = variables
      const queryKey = attendanceKeys.roster(selectedClassId, selectedDate)

      await queryClient.cancelQueries({ queryKey })

      const previousRoster = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: { success?: boolean, roster?: StudentAttendance[] } | undefined) => {
        if (!old || !old.roster)
          return old
        return {
          ...old,
          roster: old.roster.map((student: StudentAttendance) =>
            student.enrollmentId === enrollmentId
              ? {
                  ...student,
                  attendance: {
                    ...student.attendance,
                    status,
                    recordedAt: new Date(),
                  },
                }
              : student,
          ),
        }
      })

      return { previousRoster }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousRoster) {
        queryClient.setQueryData(
          attendanceKeys.roster(selectedClassId, selectedDate),
          context.previousRoster,
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.roster(selectedClassId, selectedDate),
      })
    },
  })

  // Mutation for bulk save
  const bulkSaveMutation = useMutation({
    ...attendanceMutations.saveBulk,
    onMutate: async (variables) => {
      const { attendanceRecords } = variables
      const queryKey = attendanceKeys.roster(selectedClassId, selectedDate)

      await queryClient.cancelQueries({ queryKey })

      const previousRoster = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: { success?: boolean, roster?: StudentAttendance[] } | undefined) => {
        if (!old || !old.roster)
          return old

        const updatedEnrollmentIds = new Set(
          attendanceRecords.map((r: { enrollmentId: string }) => r.enrollmentId),
        )

        return {
          ...old,
          roster: old.roster.map(student =>
            updatedEnrollmentIds.has(student.enrollmentId)
              ? {
                  ...student,
                  attendance: {
                    ...student.attendance,
                    status:
                      attendanceRecords.find(
                        (r: { enrollmentId: string }) => r.enrollmentId === student.enrollmentId,
                      )?.status || 'present',
                    recordedAt: new Date(),
                  },
                }
              : student,
          ),
        }
      })

      return { previousRoster }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousRoster) {
        queryClient.setQueryData(
          attendanceKeys.roster(selectedClassId, selectedDate),
          context.previousRoster,
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.roster(selectedClassId, selectedDate),
      })
    },
  })

  const handleStatusChange = async (
    enrollmentId: string,
    status: 'present' | 'absent' | 'late' | 'excused',
  ) => {
    await saveMutation.mutateAsync({
      enrollmentId,
      sessionId: `temp-${Date.now()}`,
      sessionDate: selectedDate,
      status,
      teacherId: context?.teacherId ?? '',
    })
  }

  const handleMarkAllPresent = async () => {
    if (!rosterData || rosterData.length === 0)
      return

    const records = rosterData
      .filter((s: StudentAttendance) => !s.attendance)
      .map((s: StudentAttendance) => ({
        enrollmentId: s.enrollmentId,
        status: 'present' as const,
      }))

    if (records.length > 0) {
      await bulkSaveMutation.mutateAsync({
        classId: selectedClassId,
        sessionId: `temp-${Date.now()}`,
        sessionDate: selectedDate,
        teacherId: context?.teacherId ?? '',
        attendanceRecords: records,
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">
        {LL.attendance.title()}
      </h1>

      <AttendanceFilters
        selectedClassId={selectedClassId}
        setSelectedClassId={setSelectedClassId}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        classes={classesData?.classes}
        counts={counts}
      />

      {/* Student Roster */}
      {selectedClassId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {LL.attendance.studentList()}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
              <IconCheck className="w-4 h-4 mr-2" />
              {LL.attendance.markAllPresent()}
            </Button>
          </CardHeader>
          <CardContent>
            {isPendingRoster
              ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(el => (
                      <Skeleton key={el} className="h-16 w-full" />
                    ))}
                  </div>
                )
              : rosterData.length === 0
                ? (
                    <p className="text-center text-muted-foreground py-8">
                      {LL.attendance.noStudents()}
                    </p>
                  )
                : (
                    <div className="space-y-2">
                      {rosterData.map((student: StudentAttendance) => (
                        <AttendanceStudentRow
                          key={student.studentId}
                          student={student}
                          onStatusChange={status =>
                            handleStatusChange(student.enrollmentId, status)}
                          isLoading={saveMutation.isPending}
                        />
                      ))}
                    </div>
                  )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
