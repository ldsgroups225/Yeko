import { IconCalendar, IconChartBar, IconFileText, IconFilter, IconLayoutGrid, IconList, IconSchool, IconSearch } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
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
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ClassAveragesTable } from '@/components/grades'
import { BulkGenerationDialog, ReportCardList } from '@/components/report-cards'
import { useSchoolContext } from '@/hooks/use-school-context'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { authClient } from '@/lib/auth-client'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { cn } from '@/lib/utils'
import { getClassAverages, recalculateAverages } from '@/school/functions/averages'
import { getClasses } from '@/school/functions/classes'
import { getEnrollments } from '@/school/functions/enrollments'
import {
  bulkGenerateReportCards,
  getReportCards,
  getReportCardTemplates,
} from '@/school/functions/report-cards'
import { getSchoolYears } from '@/school/functions/school-years'
import { getTerms } from '@/school/functions/terms'

export const Route = createFileRoute('/_auth/grades/report-cards')({
  component: ReportCardsPage,
})

function ReportCardsPage() {
  const t = useTranslations()
  const { schoolId } = useSchoolContext()
  const { schoolYearId: contextSchoolYearId, isPending: contextPending } = useSchoolYearContext()
  const queryClient = useQueryClient()
  const session = authClient.useSession()
  const authUserId = session.data?.user?.id

  const [selectedTermId, setSelectedTermId] = useState<string>('')
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [localYearId, setLocalYearId] = useState<string>('')
  const [search, setSearch] = useState('')
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'averages'>('cards')
  const navigate = useNavigate()

  // Fetch school years
  const { data: schoolYearsResult, isPending: yearsPending } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    staleTime: 5 * 60 * 1000,
  })

  // Determine effective year ID
  const schoolYears = schoolYearsResult?.success ? schoolYearsResult.data : []
  const activeYear = schoolYears?.find((y: { isActive: boolean }) => y.isActive)
  const effectiveYearId = contextSchoolYearId || localYearId || activeYear?.id || ''

  // Fetch terms for selected year
  const { data: termsResult, isPending: termsPending } = useQuery({
    queryKey: ['terms', effectiveYearId],
    queryFn: () => getTerms({ data: { schoolYearId: effectiveYearId } }),
    enabled: !!effectiveYearId,
    staleTime: 5 * 60 * 1000,
  })
  const terms = termsResult?.success ? termsResult.data : []

  // Fetch classes for selected year
  const { data: classesResult, isPending: classesPending } = useQuery({
    queryKey: ['classes', effectiveYearId],
    queryFn: () => getClasses({ data: { schoolYearId: effectiveYearId } }),
    enabled: !!effectiveYearId,
    staleTime: 5 * 60 * 1000,
  })
  const classes = classesResult?.success ? classesResult.data : []

  // Fetch students for the selected class (enrollments)
  const { data: enrollmentsData } = useQuery({
    queryKey: ['enrollments', effectiveYearId, selectedClassId],
    queryFn: () => getEnrollments({ data: { schoolYearId: effectiveYearId, classId: selectedClassId, limit: 100 } }),
    enabled: !!effectiveYearId && !!selectedClassId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch existing report cards
  const { data: reportCardsResult, isPending: reportCardsPending } = useQuery({
    queryKey: ['report-cards', selectedClassId, selectedTermId],
    queryFn: () => getReportCards({ data: { classId: selectedClassId, termId: selectedTermId } }),
    enabled: !!selectedClassId && !!selectedTermId,
  })
  const reportCards = reportCardsResult?.success ? reportCardsResult.data : []

  // Fetch all templates
  const { data: templatesResult } = useQuery({
    queryKey: ['report-card-templates', schoolId],
    queryFn: () => getReportCardTemplates({ data: { schoolId: schoolId ?? '' } }),
    enabled: !!schoolId,
  })
  const templates = templatesResult?.success ? templatesResult.data : []

  // Determine which template to use (default or first available)
  const activeTemplate = templates?.find(t => t.isDefault) || templates?.[0]

  const generateMutation = useMutation({
    mutationKey: schoolMutationKeys.reportCards.generate,
    mutationFn: async (studentIds: string[]) => {
      if (!authUserId)
        throw new Error('IconUser not found')

      if (!activeTemplate)
        throw new Error('No report card template found. Please create one in settings.')

      return await bulkGenerateReportCards({
        data: {
          classId: selectedClassId,
          termId: selectedTermId,
          schoolYearId: effectiveYearId,
          templateId: activeTemplate.id,
          studentIds,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-cards'] })
      toast.success(t.reportCards.generationComplete())
    },
    onError: (error) => {
      toast.error(error.message || t.common.error())
    },
  })

  // Fetch Class Averages
  const { data: averagesResult, isPending: averagesPending } = useQuery({
    queryKey: ['class-averages', selectedClassId, selectedTermId],
    queryFn: () => getClassAverages({ data: { classId: selectedClassId, termId: selectedTermId } }),
    enabled: !!selectedClassId && !!selectedTermId && viewMode === 'averages',
    staleTime: 5 * 60 * 1000,
  })
  const classAverages = averagesResult?.success ? averagesResult.data : []

  // Recalculate Mutation
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      return await recalculateAverages({
        data: {
          classId: selectedClassId,
          termId: selectedTermId,
        },
      })
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(t.academic.grades.averages.recalculateSuccess())
        queryClient.invalidateQueries({ queryKey: ['class-averages'] })
      }
      else {
        toast.error(typeof res.error === 'string' ? res.error : t.academic.grades.averages.recalculateError())
      }
    },
    onError: () => toast.error(t.academic.grades.averages.recalculateTechnicalError()),
  })

  const canShowReportCards = effectiveYearId && selectedTermId && selectedClassId

  const mappedReportCards = (reportCards || [])
    .filter((rc) => {
      if (!search)
        return true
      const searchLower = search.toLowerCase()
      return (
        rc.student.firstName.toLowerCase().includes(searchLower)
        || rc.student.lastName.toLowerCase().includes(searchLower)
        || rc.student.matricule?.toLowerCase().includes(searchLower)
      )
    })
    .map(rc => ({
      id: rc.id,
      studentId: rc.studentId,
      studentName: `${rc.student.lastName} ${rc.student.firstName}`,
      studentMatricule: rc.student.matricule,
      status: rc.status,
      generatedAt: rc.generatedAt,
      sentAt: rc.sentAt,
      deliveryMethod: rc.deliveryMethod,
      pdfUrl: rc.pdfUrl,
    }))

  const mappedStudents = (enrollmentsData?.success ? enrollmentsData.data.data : []).map(e => ({
    id: e.student.id,
    name: `${e.student.lastName} ${e.student.firstName}`,
    matricule: e.student.matricule || undefined,
    hasReportCard: reportCards?.some(rc => rc.studentId === e.student.id),
  }))

  const currentClass = classes?.find(c => c.class.id === selectedClassId)
  const currentTerm = terms?.find(t => t.id === selectedTermId)

  const handleDownload = (id: string) => {
    const rc = reportCards?.find(r => r.id === id)
    if (rc?.pdfUrl)
      window.open(rc.pdfUrl, '_blank')
    else
      toast.error(t.common.error())
  }

  const handlePreview = (id: string) => {
    const rc = reportCards?.find(r => r.id === id)
    if (rc) {
      if (rc.pdfUrl)
        window.open(rc.pdfUrl, '_blank')
      else
        navigate({ to: '/students/$studentId', params: { studentId: rc.studentId } })
    }
  }

  return (
    <div className="space-y-8">

      {/* Filters Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border/40 bg-card/30 p-6 backdrop-blur-xl shadow-xl space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* School Year */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t.settings.schoolYears.title()}
            </Label>
            {yearsPending || contextPending
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={effectiveYearId}
                    onValueChange={val => setLocalYearId(val ?? '')}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all">
                      <div className="flex items-center gap-2">
                        <IconCalendar className="size-3.5 text-muted-foreground" />
                        <SelectValue placeholder={t.schoolYear.select()}>
                          {schoolYears?.find(y => y.id === effectiveYearId)?.template.name}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                      {schoolYears?.map(year => (
                        <SelectItem key={year.id} value={year.id} className="rounded-lg font-semibold">
                          {year.template.name}
                          {year.isActive && ` (${t.schoolYear.activeSuffix()})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>

          {/* Term */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t.academic.grades.entry.term()}
            </Label>
            {termsPending || contextPending
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={selectedTermId}
                    onValueChange={val => setSelectedTermId(val ?? '')}
                    disabled={!effectiveYearId}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all">
                      <SelectValue placeholder={t.terms.select()}>
                        {currentTerm?.template.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                      {terms?.map(term => (
                        <SelectItem key={term.id} value={term.id} className="rounded-lg font-semibold">
                          {term.template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>

          {/* Class */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t.academic.grades.entry.class()}
            </Label>
            {classesPending || contextPending
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={selectedClassId}
                    onValueChange={val => setSelectedClassId(val ?? '')}
                    disabled={!effectiveYearId}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all">
                      <div className="flex items-center gap-2">
                        <IconLayoutGrid className="size-3.5 text-muted-foreground" />
                        <SelectValue placeholder={t.classes.select()}>
                          {currentClass ? `${currentClass.grade.name} ${currentClass.class.section}` : null}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                      {classes?.map(item => (
                        <SelectItem key={item.class.id} value={item.class.id} className="rounded-lg font-semibold">
                          {item.grade.name}
                          {' '}
                          {item.class.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>
        </div>

        {canShowReportCards && (
          <div className="pt-4 border-t border-border/10 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder={t.students.searchPlaceholder()}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-11 border-border/40 bg-background/40 pl-9 transition-all focus:bg-background shadow-none rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex bg-muted/20 p-1 rounded-xl border border-border/20 mr-2">
                <Button
                  variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className={cn('h-9 px-3', viewMode === 'cards' && 'shadow-sm')}
                >
                  <IconList className="mr-2 h-4 w-4" />
                  {t.academic.grades.averages.viewCards()}
                </Button>
                <Button
                  variant={viewMode === 'averages' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('averages')}
                  className={cn('h-9 px-3', viewMode === 'averages' && 'shadow-sm')}
                >
                  <IconChartBar className="mr-2 h-4 w-4" />
                  {t.academic.grades.averages.viewAverages()}
                </Button>
              </div>

              <Button
                variant="outline"
                className="h-11 px-6 border-border/40 bg-background/40 hover:bg-background rounded-xl font-bold uppercase tracking-widest text-[10px]"
              >
                <IconFilter className="mr-2 h-4 w-4" />
                {t.common.filters()}
              </Button>
              <Button
                variant={viewMode === 'averages' ? 'secondary' : 'default'}
                className={cn('h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]', viewMode === 'averages' ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20' : 'bg-primary hover:bg-primary/90 text-primary-foreground')}
                onClick={() => {
                  if (viewMode === 'averages')
                    recalculateMutation.mutate()
                  else
                    setIsGenerationDialogOpen(true)
                }}
                disabled={recalculateMutation.isPending}
              >
                {recalculateMutation.isPending
                  ? <IconSchool className="mr-2 h-4 w-4 animate-spin" />
                  : <IconFileText className="mr-2 h-4 w-4" />}
                {viewMode === 'averages' ? t.academic.grades.averages.recalculate() : t.reportCards.generate()}
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Report Cards List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {canShowReportCards
          ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {viewMode === 'cards'
                    ? (
                        <ReportCardList
                          reportCards={mappedReportCards}
                          isPending={reportCardsPending}
                          onDownload={handleDownload}
                          onPreview={handlePreview}
                        />
                      )
                    : (
                        <div className="relative">
                          {averagesPending && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl">
                              <Skeleton className="h-full w-full opacity-20" />
                            </div>
                          )}
                          <ClassAveragesTable
                            averages={classAverages}
                            onStudentClick={studentId => navigate({ to: '/students/$studentId', params: { studentId } })}
                          />
                        </div>
                      )}
                </motion.div>
              </AnimatePresence>
            )
          : (
              <Card className="rounded-3xl border border-dashed border-border/60 bg-card/20 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-6 rounded-full bg-background/50 mb-6 shadow-inner">
                    <IconSchool className="size-16 text-muted-foreground/20" />
                  </div>
                  <h3 className="text-xl font-bold text-muted-foreground mb-2">{t.reportCards.selectFiltersPrompt()}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">{t.academic.grades.statistics.description()}</p>
                </CardContent>
              </Card>
            )}
      </motion.div>

      <BulkGenerationDialog
        open={isGenerationDialogOpen}
        onOpenChange={setIsGenerationDialogOpen}
        students={mappedStudents}
        className={currentClass ? `${currentClass.grade.name} ${currentClass.class.section}` : ''}
        termName={currentTerm?.template.name || ''}
        onGenerate={async (ids) => {
          const res = await generateMutation.mutateAsync(ids)
          if (!res.success) {
            throw new Error(typeof res.error === 'string' ? res.error : 'Erreur lors de la génération')
          }
          return res.data
        }}
      />
    </div>
  )
}
