import { IconCheck, IconClock, IconUser, IconX } from '@tabler/icons-react'
/**
 * Attendance Page
 * Student attendance tracking during class sessions
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { DatePicker } from '@workspace/ui/components/date-picker'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useMemo, useState } from 'react'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { attendanceKeys, attendanceMutations, classRosterQueryOptions } from '@/lib/queries/attendance'
import { teacherClassesQueryOptions } from '@/lib/queries/classes'

export const Route = createFileRoute('/_auth/app/attendance')({
  component: AttendancePage,
})

interface StudentAttendance {
  studentId: string
  firstName: string
  lastName: string
  matricule: string | null
  photoUrl: string | null
  enrollmentId: string
  attendance: {
    id: string
    status: 'present' | 'absent' | 'late' | 'excused'
    notes: string | null
    recordedAt: Date | null
  } | null
}

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
    if (!rosterData) {
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
      .filter(s => !s.attendance)
      .map(s => ({
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

      {/* Class and Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            {LL.attendance.selectClass()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                {LL.attendance.class()}
              </label>
              <select
                className="w-full mt-1 border rounded-md p-2"
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
              >
                <option value="">
                  {LL.attendance.selectClass()}
                </option>
                {classesData?.classes?.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">
                {LL.attendance.date()}
              </label>
              <DatePicker
                date={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={(date: Date | undefined) => setSelectedDate(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                className="w-full mt-1 border rounded-md p-2 justify-start font-normal"
              />
            </div>
          </div>

          {counts && (
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">
                {LL.attendance.total()}
                :
                {counts.total}
              </Badge>
              <Badge className="bg-success/10 text-success">
                {LL.attendance.present()}
                :
                {counts.present}
              </Badge>
              <Badge className="bg-destructive/10 text-destructive">
                {LL.attendance.absent()}
                :
                {counts.absent}
              </Badge>
              <Badge className="bg-accent/10 text-accent-foreground">
                {LL.attendance.late()}
                :
                {counts.late}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

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
                      {rosterData.map(student => (
                        <StudentRow
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

function StudentRow({
  student,
  onStatusChange,
  isLoading,
}: {
  student: StudentAttendance
  onStatusChange: (status: 'present' | 'absent' | 'late' | 'excused') => void
  isLoading: boolean
}) {
  const { LL } = useI18nContext()

  const currentStatus = student.attendance?.status

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={student.photoUrl ?? undefined} />
          <AvatarFallback>
            {student.firstName[0]}
            {student.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">
            {student.lastName}
            {' '}
            {student.firstName}
          </p>
          {student.matricule && (
            <p className="text-sm text-muted-foreground">{student.matricule}</p>
          )}
        </div>
      </div>

      <div className="flex gap-1">
        <Button
          variant={currentStatus === 'present' ? 'default' : 'outline'}
          size="sm"
          className="min-w-[80px]"
          onClick={() => onStatusChange('present')}
          disabled={isLoading}
        >
          <IconCheck className="w-4 h-4 mr-1" />
          {LL.attendance.status.present()}
        </Button>
        <Button
          variant={currentStatus === 'absent' ? 'destructive' : 'outline'}
          size="sm"
          className="min-w-[80px]"
          onClick={() => onStatusChange('absent')}
          disabled={isLoading}
        >
          <IconX className="w-4 h-4 mr-1" />
          {LL.attendance.status.absent()}
        </Button>
        <Button
          variant={currentStatus === 'late' ? 'secondary' : 'outline'}
          size="sm"
          className="min-w-[80px]"
          onClick={() => onStatusChange('late')}
          disabled={isLoading}
        >
          <IconClock className="w-4 h-4 mr-1" />
          {LL.attendance.status.late()}
        </Button>
        <Button
          variant={currentStatus === 'excused' ? 'outline' : 'outline'}
          size="sm"
          className="min-w-[80px]"
          onClick={() => onStatusChange('excused')}
          disabled={isLoading}
        >
          <IconUser className="w-4 h-4 mr-1" />
          {LL.attendance.status.excused()}
        </Button>
      </div>
    </div>
  )
}
