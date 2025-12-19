import type { TimetableViewMode } from '@/components/timetables'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import {
  TimetableGrid,
  TimetableViewSwitcher,
} from '@/components/timetables'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { timetablesOptions } from '@/lib/queries/timetables'
import { getClasses } from '@/school/functions/classes'
import { getSchoolYears } from '@/school/functions/school-years'
import { getTeachers } from '@/school/functions/teachers'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/schedules')({
  component: TimetablesPage,
})

function TimetablesPage() {
  const { t } = useTranslation()
  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()
  const [viewMode, setViewMode] = useState<TimetableViewMode>('class')
  const [localYearId, setLocalYearId] = useState<string>('')
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')

  // Fetch school years
  const { data: schoolYears, isLoading: yearsLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    staleTime: 5 * 60 * 1000,
  })

  // Determine effective year ID
  const activeYear = schoolYears?.find((y: { isActive: boolean }) => y.isActive)
  const effectiveYearId = contextSchoolYearId || localYearId || activeYear?.id || ''

  // Fetch classes for selected year
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', effectiveYearId],
    queryFn: () => getClasses({ data: { schoolYearId: effectiveYearId } }),
    enabled: !!effectiveYearId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch teachers
  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ data: {} }),
    staleTime: 5 * 60 * 1000,
  })
  const teachers = teachersData?.teachers ?? []

  // Fetch timetable for class view
  const { data: classTimetable, isLoading: classTimetableLoading } = useQuery({
    ...timetablesOptions.byClass({ classId: selectedClassId, schoolYearId: effectiveYearId }),
    enabled: viewMode === 'class' && !!selectedClassId && !!effectiveYearId,
  })

  // Fetch timetable for teacher view
  const { data: teacherTimetable, isLoading: teacherTimetableLoading } = useQuery({
    ...timetablesOptions.byTeacher({ teacherId: selectedTeacherId, schoolYearId: effectiveYearId }),
    enabled: viewMode === 'teacher' && !!selectedTeacherId && !!effectiveYearId,
  })

  const timetable = viewMode === 'class' ? classTimetable : teacherTimetable
  const timetableLoading = viewMode === 'class' ? classTimetableLoading : teacherTimetableLoading

  const handleViewModeChange = (mode: TimetableViewMode) => {
    setViewMode(mode)
    setSelectedClassId('')
    setSelectedTeacherId('')
  }

  const canShowTimetable
    = effectiveYearId
    && ((viewMode === 'class' && selectedClassId)
      || (viewMode === 'teacher' && selectedTeacherId))

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.academic'), href: '/academic' },
          { label: t('nav.timetables') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('timetables.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('timetables.description')}
        </p>
      </div>

      {/* View Switcher and Filters */}
      <div className="flex flex-col gap-4">
        <TimetableViewSwitcher value={viewMode} onChange={handleViewModeChange} />

        <div className="flex flex-col sm:flex-row gap-4">
          {/* School Year */}
          <div className="w-full sm:w-[200px]">
            {yearsLoading
              ? (
                <Skeleton className="h-10 w-full" />
              )
              : (
                <Select value={effectiveYearId} onValueChange={setLocalYearId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('schoolYear.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolYears?.map((year: { id: string, name: string, isActive: boolean }) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                        {' '}
                        {year.isActive && t('schoolYear.activeSuffix')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
          </div>

          {/* Class selector (for class view) */}
          {viewMode === 'class' && (
            <div className="w-full sm:w-[200px]">
              {classesLoading
                ? (
                  <Skeleton className="h-10 w-full" />
                )
                : (
                  <Select
                    value={selectedClassId}
                    onValueChange={setSelectedClassId}
                    disabled={!effectiveYearId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('classes.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((cls: { id: string, name: string }) => (
                        <SelectItem key={generateUUID()} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
            </div>
          )}

          {/* Teacher selector (for teacher view) */}
          {viewMode === 'teacher' && (
            <div className="w-full sm:w-[200px]">
              {teachersLoading
                ? (
                  <Skeleton className="h-10 w-full" />
                )
                : (
                  <Select
                    value={selectedTeacherId}
                    onValueChange={setSelectedTeacherId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('teachers.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers?.map((teacher: { id: string, firstName: string, lastName: string }) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName}
                          {' '}
                          {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Timetable Grid */}
      {canShowTimetable
        ? (
          <TimetableGrid
            sessions={timetable ?? []}
            isLoading={timetableLoading}
            readOnly
          />
        )
        : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>{t('timetables.selectFiltersPrompt')}</p>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
