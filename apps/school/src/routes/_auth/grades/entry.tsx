import type { GradeType } from '@/schemas/grade'
import { IconCalendar, IconClipboardCheck, IconLayoutGrid, IconListCheck, IconRotate, IconSettings, IconSparkles, IconUserCheck } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { DatePicker } from '@workspace/ui/components/date-picker'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { useState } from 'react'
import { GradeEntryTable, GradeTypeSelector } from '@/components/grades'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useCurrentTeacher } from '@/hooks/use-current-teacher'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { classSubjectsKeys } from '@/lib/queries/class-subjects'
import { classesOptions } from '@/lib/queries/classes'
import { enrollmentsOptions } from '@/lib/queries/enrollments'
import { gradesOptions } from '@/lib/queries/grades'
import { termsOptions } from '@/lib/queries/terms'
import { defaultGradeWeights } from '@/schemas/grade'
import { getClassSubjects } from '@/school/functions/class-subjects'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/grades/entry')({
  component: GradeEntryPage,
})

function GradeEntryPage() {
  const t = useTranslations()
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
    classesOptions.list({ schoolYearId: schoolYearId ?? undefined, status: 'active' }),
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

  // Determine effective teacher ID (assigned teacher for subject or current user if they are a teacher)
  const selectedClassSubject = classSubjectsData?.find(
    cs => cs.subject.id === selectedSubjectId,
  )
  const effectiveTeacherId = selectedClassSubject?.teacher?.id || currentTeacher?.id || ''

  // Transform enrolled students to the format expected by GradeEntryTable
  // Transform enrolled students to the format expected by GradeEntryTable
  const students = enrollmentsData?.data?.map(e => ({
    id: e.student.id,
    firstName: e.student.firstName,
    lastName: e.student.lastName,
    matricule: e.student.matricule || undefined,
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

  const handleReset = () => {
    setSelectedClassId('')
    setSelectedSubjectId('')
    setSelectedTermId('')
    setGradeType('test')
    setWeight(defaultGradeWeights.test)
    setDescription('')
    setGradeDate(new Date().toISOString().split('T')[0])
  }

  const handleNewEvaluation = () => {
    setDescription('')
    setGradeDate(new Date().toISOString().split('T')[0])
    setGradeType('test')
    setWeight(defaultGradeWeights.test)
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: t.nav.grades(), href: '/grades' },
          { label: t.academic.grades.entry.title() },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <IconClipboardCheck className="size-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{t.academic.grades.entry.title()}</h1>
            <p className="text-muted-foreground font-medium italic">{t.academic.grades.entry.subtitle()}</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl">
          <CardHeader className="bg-muted/20 border-b border-border/20 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-background/50 text-muted-foreground shadow-sm">
                  <IconSettings className="size-4" />
                </div>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">{t.academic.grades.entry.parameters()}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 gap-2 rounded-lg text-xs font-bold hover:bg-background/50 text-muted-foreground hover:text-primary transition-all"
              >
                <IconRotate className="size-3.5" />
                {t.common.reset()}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2.5">
                <Label htmlFor="class-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t.academic.grades.entry.class()}
                </Label>
                {classesLoading
                  ? (
                      <Skeleton className="h-11 w-full rounded-xl" />
                    )
                  : (
                      <Select value={selectedClassId} onValueChange={val => handleClassChange(val ?? '')}>
                        <SelectTrigger id="class-select" className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all">
                          <SelectValue placeholder={t.academic.grades.entry.selectClass()}>
                            {selectedClassId && (() => {
                              const selectedItem = classesData?.find(item => item.class.id === selectedClassId)
                              return selectedItem
                                ? (
                                    <div className="flex items-center gap-2">
                                      <IconLayoutGrid className="size-3.5 text-primary/60" />
                                      <span className="font-semibold">
                                        {selectedItem.grade.name}
                                        {' '}
                                        {selectedItem.class.section}
                                      </span>
                                    </div>
                                  )
                                : null
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                          {classesData?.map(item => (
                            <SelectItem key={item.class.id} value={item.class.id} className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <IconLayoutGrid className="size-3.5 text-primary/60" />
                                <span className="font-semibold">
                                  {item.grade.name}
                                  {' '}
                                  {item.class.section}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="subject-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t.academic.grades.entry.subject()}
                </Label>
                {subjectsLoading
                  ? (
                      <Skeleton className="h-11 w-full rounded-xl" />
                    )
                  : (
                      <Select
                        value={selectedSubjectId}
                        onValueChange={val => setSelectedSubjectId(val ?? '')}
                        disabled={!selectedClassId || !classSubjectsData?.length}
                      >
                        <SelectTrigger id="subject-select" className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all">
                          <SelectValue placeholder={t.academic.grades.entry.selectSubject()}>
                            {selectedSubjectId && (() => {
                              const selectedItem = classSubjectsData?.find(cs => cs.subject.id === selectedSubjectId)
                              return selectedItem
                                ? (
                                    <div className="flex items-center gap-2">
                                      <IconSparkles className="size-3.5 text-primary/60" />
                                      <span className="font-semibold">{selectedItem.subject.name}</span>
                                    </div>
                                  )
                                : null
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                          {classSubjectsData?.map(cs => (
                            <SelectItem key={cs.subject.id} value={cs.subject.id} className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <IconSparkles className="size-3.5 text-primary/60" />
                                <span className="font-semibold">{cs.subject.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="term-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t.academic.grades.entry.term()}
                </Label>
                {termsLoading
                  ? (
                      <Skeleton className="h-11 w-full rounded-xl" />
                    )
                  : (
                      <Select
                        value={selectedTermId}
                        onValueChange={val => setSelectedTermId(val ?? '')}
                        disabled={!termsData?.length}
                      >
                        <SelectTrigger id="term-select" className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all">
                          <SelectValue placeholder={t.academic.grades.entry.selectTerm()}>
                            {selectedTermId && (() => {
                              const selectedItem = termsData?.find(term => term.id === selectedTermId)
                              return selectedItem
                                ? (
                                    <div className="flex items-center gap-2">
                                      <IconCalendar className="size-3.5 text-primary/60" />
                                      <span className="font-semibold">{selectedItem.template.name}</span>
                                    </div>
                                  )
                                : null
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                          {termsData?.map(term => (
                            <SelectItem key={term.id} value={term.id} className="rounded-lg">
                              <span className="font-semibold">{term.template.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="grade-type-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t.academic.grades.entry.gradeType()}
                </Label>
                <GradeTypeSelector
                  value={gradeType}
                  onValueChange={handleGradeTypeChange}
                />
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div className="space-y-2.5">
                <Label htmlFor="coefficient-input" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t.academic.grades.entry.coefficient()}
                </Label>
                <div className="relative group">
                  <Input
                    id="coefficient-input"
                    type="number"
                    min={1}
                    max={10}
                    value={weight}
                    onChange={e => setWeight(Number(e.target.value))}
                    className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all font-bold"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <IconUserCheck className="size-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="date-input" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t.academic.grades.entry.date()}
                </Label>
                <DatePicker
                  date={gradeDate ? new Date(gradeDate) : undefined}
                  onSelect={(date: Date | undefined) => setGradeDate(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                  placeholder={t.academic.grades.entry.date()}
                  className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all font-bold"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="description-input" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t.academic.grades.entry.gradeDescription()}
                </Label>
                <Input
                  id="description-input"
                  placeholder={t.academic.grades.entry.descriptionPlaceholder()}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all font-medium italic"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {canFetchGrades && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl">
            <CardHeader className="bg-muted/20 border-b border-border/20 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-inner">
                  <IconListCheck className="size-5" />
                </div>
                <CardTitle className="text-xl font-black tracking-tight">{t.academic.grades.entry.studentGrades()}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              {gradesLoading || studentsLoading
                ? (
                    <div className="space-y-4">
                      {Array.from({ length: 10 }).map(() => (
                        <div key={generateUUID()} className="flex items-center gap-4">
                          <Skeleton className="h-12 flex-1 rounded-xl" />
                          <Skeleton className="h-12 w-24 rounded-xl" />
                          <Skeleton className="h-12 w-32 rounded-xl" />
                        </div>
                      ))}
                    </div>
                  )
                : (
                    <GradeEntryTable
                      key={`${gradeType}-${description}-${gradeDate}`}
                      classId={selectedClassId}
                      subjectId={selectedSubjectId}
                      termId={selectedTermId}
                      teacherId={effectiveTeacherId}
                      gradeType={gradeType}
                      weight={weight}
                      description={description}
                      gradeDate={gradeDate}
                      students={students}
                      existingGrades={gradesData ?? []}
                      onSubmissionComplete={() => {
                        setDescription('')
                      }}
                      onReset={handleNewEvaluation}
                    />
                  )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
