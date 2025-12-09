import type { Class } from '@repo/data-ops'
import type { GradeType } from '@/schemas/grade'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GradeEntryTable, GradeTypeSelector } from '@/components/grades'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentTeacher } from '@/hooks/use-current-teacher'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { classSubjectsKeys } from '@/lib/queries/class-subjects'
import { classesOptions } from '@/lib/queries/classes'
import { enrollmentsOptions } from '@/lib/queries/enrollments'
import { gradesOptions } from '@/lib/queries/grades'
import { termsOptions } from '@/lib/queries/terms'
import { defaultGradeWeights } from '@/schemas/grade'
import { getClassSubjects } from '@/school/functions/class-subjects'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/app/academic/grades/entry')({
  component: GradeEntryPage,
})

function GradeEntryPage() {
  const { t } = useTranslation()
  const { schoolYearId } = useSchoolYearContext()
  const { data: currentTeacher } = useCurrentTeacher()
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedTermId, setSelectedTermId] = useState<string>('')
  const [gradeType, setGradeType] = useState<GradeType>('test')
  const [weight, setWeight] = useState(defaultGradeWeights.test)
  const [description, setDescription] = useState('')
  const [gradeDate, setGradeDate] = useState(new Date().toISOString().split('T')[0])

  // Fetch classes for current school year
  const { data: classesData, isLoading: classesLoading } = useQuery(
    classesOptions.list({ schoolYearId, status: 'active' }),
  )

  // Fetch subjects for selected class
  const { data: classSubjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: classSubjectsKeys.list({ classId: selectedClassId }),
    queryFn: () => getClassSubjects({ data: { classId: selectedClassId } }),
    enabled: !!selectedClassId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch terms for current school year
  const { data: termsData, isLoading: termsLoading } = useQuery(
    termsOptions.list(schoolYearId ?? ''),
  )

  // Fetch enrolled students for selected class
  const { data: enrollmentsData, isLoading: studentsLoading } = useQuery({
    ...enrollmentsOptions.list({
      classId: selectedClassId,
      schoolYearId: schoolYearId ?? '',
      status: 'confirmed',
    }),
    enabled: !!selectedClassId && !!schoolYearId,
  })

  // Fetch grades when all selections are made
  const canFetchGrades = selectedClassId && selectedSubjectId && selectedTermId
  const { data: gradesData, isLoading: gradesLoading } = useQuery({
    ...gradesOptions.byClass({
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      termId: selectedTermId,
    }),
    enabled: !!canFetchGrades,
  })

  // Transform enrolled students to the format expected by GradeEntryTable
  const students = enrollmentsData?.data?.map((e: any) => ({
    id: e.student.id,
    firstName: e.student.firstName,
    lastName: e.student.lastName,
    matricule: e.student.matricule,
  })) ?? []

  // Reset subject when class changes
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId)
    setSelectedSubjectId('')
  }

  const handleGradeTypeChange = (type: GradeType) => {
    setGradeType(type)
    setWeight(defaultGradeWeights[type])
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.academic'), href: '/app/academic' },
          { label: t('nav.grades'), href: '/app/academic/grades' },
          { label: t('academic.grades.entry.title') },
        ]}
      />

      <div className="flex items-center gap-4">
        <Link to="/app/academic/grades">
          <Button variant="ghost" size="icon" aria-label={t('common.back')}>
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('academic.grades.entry.title')}</h1>
          <p className="text-muted-foreground">
            {t('academic.grades.entry.subtitle')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('academic.grades.entry.parameters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="class-select">{t('academic.grades.entry.class')}</Label>
              {classesLoading
                ? (
                    <Skeleton className="h-10 w-full" />
                  )
                : (
                    <Select value={selectedClassId} onValueChange={handleClassChange}>
                      <SelectTrigger id="class-select">
                        <SelectValue placeholder={t('academic.grades.entry.selectClass')} />
                      </SelectTrigger>
                      <SelectContent>
                        {classesData?.map((cls: Class & { grade?: { name: string } }) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.grade?.name}
                            {' '}
                            {cls.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-select">{t('academic.grades.entry.subject')}</Label>
              {subjectsLoading
                ? (
                    <Skeleton className="h-10 w-full" />
                  )
                : (
                    <Select
                      value={selectedSubjectId}
                      onValueChange={setSelectedSubjectId}
                      disabled={!selectedClassId || !classSubjectsData?.length}
                    >
                      <SelectTrigger id="subject-select">
                        <SelectValue placeholder={t('academic.grades.entry.selectSubject')} />
                      </SelectTrigger>
                      <SelectContent>
                        {classSubjectsData?.map((cs: any) => (
                          <SelectItem key={cs.subject.id} value={cs.subject.id}>
                            {cs.subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="term-select">{t('academic.grades.entry.term')}</Label>
              {termsLoading
                ? (
                    <Skeleton className="h-10 w-full" />
                  )
                : (
                    <Select
                      value={selectedTermId}
                      onValueChange={setSelectedTermId}
                      disabled={!termsData?.length}
                    >
                      <SelectTrigger id="term-select">
                        <SelectValue placeholder={t('academic.grades.entry.selectTerm')} />
                      </SelectTrigger>
                      <SelectContent>
                        {termsData?.map((term: any) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade-type-select">{t('academic.grades.entry.gradeType')}</Label>
              <GradeTypeSelector
                value={gradeType}
                onValueChange={handleGradeTypeChange}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="coefficient-input">{t('academic.grades.entry.coefficient')}</Label>
              <Input
                id="coefficient-input"
                type="number"
                min={1}
                max={10}
                value={weight}
                onChange={e => setWeight(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-input">{t('academic.grades.entry.date')}</Label>
              <Input
                id="date-input"
                type="date"
                value={gradeDate}
                onChange={e => setGradeDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description-input">{t('academic.grades.entry.gradeDescription')}</Label>
              <Input
                id="description-input"
                placeholder={t('academic.grades.entry.descriptionPlaceholder')}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {canFetchGrades && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('academic.grades.entry.studentGrades')}</CardTitle>
          </CardHeader>
          <CardContent>
            {gradesLoading || studentsLoading
              ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map(() => (
                      <Skeleton key={generateUUID()} className="h-12 w-full" />
                    ))}
                  </div>
                )
              : (
                  <GradeEntryTable
                    classId={selectedClassId}
                    subjectId={selectedSubjectId}
                    termId={selectedTermId}
                    teacherId={currentTeacher?.id ?? ''}
                    gradeType={gradeType}
                    weight={weight}
                    description={description}
                    gradeDate={gradeDate}
                    students={students}
                    existingGrades={gradesData ?? []}
                  />
                )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
