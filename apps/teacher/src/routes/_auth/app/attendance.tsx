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
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { teacherClassesQueryOptions } from '@/lib/queries/classes'
import {
  saveAttendance,
  saveBulkAttendance,
} from '@/teacher/functions/attendance'

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

interface RosterResponse {
  success: boolean
  roster: StudentAttendance[]
}

interface CountsResponse {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  notMarked: number
}

function AttendancePage() {
  const { t } = useTranslation()
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
  const { data: rosterData, isLoading: isLoadingRoster } = useQuery({
    queryKey: ['attendance', 'classRoster', selectedClassId, selectedDate],
    queryFn: async (): Promise<RosterResponse> => {
      const { getClassRoster } = await import('@/teacher/functions/attendance')
      return getClassRoster({
        data: {
          classId: selectedClassId,
          schoolYearId: context?.schoolYearId ?? '',
          date: selectedDate,
        },
      })
    },
    enabled: Boolean(selectedClassId && context?.schoolYearId),
  })

  // Query for attendance counts
  const { data: counts } = useQuery({
    queryKey: ['attendance', 'counts', selectedClassId, selectedDate],
    queryFn: async (): Promise<CountsResponse> => {
      if (!rosterData?.roster) {
        return {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          notMarked: 0,
        }
      }
      return {
        total: rosterData.roster.length,
        present: rosterData.roster.filter(
          s => s.attendance?.status === 'present',
        ).length,
        absent: rosterData.roster.filter(
          s => s.attendance?.status === 'absent',
        ).length,
        late: rosterData.roster.filter(s => s.attendance?.status === 'late')
          .length,
        excused: rosterData.roster.filter(
          s => s.attendance?.status === 'excused',
        ).length,
        notMarked: rosterData.roster.filter(s => !s.attendance).length,
      }
    },
    enabled: Boolean(
      selectedClassId && context?.schoolYearId && rosterData?.roster,
    ),
  })

  // Mutation for saving individual attendance
  const saveMutation = useMutation({
    mutationFn: saveAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', 'classRoster', selectedClassId, selectedDate],
      })
    },
  })

  // Mutation for bulk save
  const bulkSaveMutation = useMutation({
    mutationFn: saveBulkAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', 'classRoster', selectedClassId, selectedDate],
      })
    },
  })

  const handleStatusChange = async (
    enrollmentId: string,
    status: 'present' | 'absent' | 'late' | 'excused',
  ) => {
    await saveMutation.mutateAsync({
      data: {
        enrollmentId,
        sessionId: `temp-${Date.now()}`,
        sessionDate: selectedDate,
        status,
        teacherId: context?.teacherId ?? '',
      },
    })
  }

  const handleMarkAllPresent = async () => {
    if (!rosterData?.roster)
      return

    const records = rosterData.roster
      .filter(s => !s.attendance)
      .map(s => ({
        enrollmentId: s.enrollmentId,
        status: 'present' as const,
      }))

    if (records.length > 0) {
      await bulkSaveMutation.mutateAsync({
        data: {
          classId: selectedClassId,
          sessionId: `temp-${Date.now()}`,
          sessionDate: selectedDate,
          teacherId: context?.teacherId ?? '',
          attendanceRecords: records,
        },
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">
        {t('attendance.title', 'Présence')}
      </h1>

      {/* Class and Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('attendance.selectClass', 'Sélectionner la classe')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                {t('attendance.class', 'Classe')}
              </label>
              <select
                className="w-full mt-1 border rounded-md p-2"
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
              >
                <option value="">
                  {t('attendance.selectClass', 'Sélectionner une classe')}
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
                {t('attendance.date', 'Date')}
              </label>
              <input
                type="date"
                className="w-full mt-1 border rounded-md p-2"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {counts && (
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">
                {t('attendance.total', 'Total')}
                :
                {counts.total}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {t('attendance.present', 'Présents')}
                :
                {counts.present}
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                {t('attendance.absent', 'Absents')}
                :
                {counts.absent}
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800">
                {t('attendance.late', 'Retards')}
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
              {t('attendance.studentList', 'Liste des élèves')}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
              <IconCheck className="w-4 h-4 mr-2" />
              {t('attendance.markAllPresent', 'Tout marquer présent')}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingRoster
              ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(el => (
                      <Skeleton key={el} className="h-16 w-full" />
                    ))}
                  </div>
                )
              : rosterData?.roster?.length === 0
                ? (
                    <p className="text-center text-muted-foreground py-8">
                      {t('attendance.noStudents', 'Aucun élève dans cette classe')}
                    </p>
                  )
                : (
                    <div className="space-y-2">
                      {rosterData?.roster?.map(student => (
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
  const { t } = useTranslation()

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
          {t('attendance.status.present', 'Présent')}
        </Button>
        <Button
          variant={currentStatus === 'absent' ? 'destructive' : 'outline'}
          size="sm"
          className="min-w-[80px]"
          onClick={() => onStatusChange('absent')}
          disabled={isLoading}
        >
          <IconX className="w-4 h-4 mr-1" />
          {t('attendance.status.absent', 'Absent')}
        </Button>
        <Button
          variant={currentStatus === 'late' ? 'secondary' : 'outline'}
          size="sm"
          className="min-w-[80px]"
          onClick={() => onStatusChange('late')}
          disabled={isLoading}
        >
          <IconClock className="w-4 h-4 mr-1" />
          {t('attendance.status.late', 'Retard')}
        </Button>
        <Button
          variant={currentStatus === 'excused' ? 'outline' : 'outline'}
          size="sm"
          className="min-w-[80px]"
          onClick={() => onStatusChange('excused')}
          disabled={isLoading}
        >
          <IconUser className="w-4 h-4 mr-1" />
          {t('attendance.status.excused', 'Excusé')}
        </Button>
      </div>
    </div>
  )
}
