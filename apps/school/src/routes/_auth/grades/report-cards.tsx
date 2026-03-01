import { IconCalendar, IconLayoutGrid, IconSchool } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent } from '@workspace/ui/components/card'
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
import { ReportCardsToolbar } from '@/components/report-cards/report-cards-toolbar'
import { useSchoolContext } from '@/hooks/use-school-context'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { authClient } from '@/lib/auth-client'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { getClassAverages, recalculateAverages } from '@/school/functions/averages'
import { getClasses } from '@/school/functions/classes'
import { getEnrollments } from '@/school/functions/enrollments'
import {
  bulkGenerateReportCards,
  getReportCards,
  getReportCardTemplates,
} from '@/school/functions/report-cards'

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
  const [search, setSearch] = useState('')
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'averages'>('cards')
  const navigate = useNavigate()

  const [prevContextYear, setPrevContextYear] = useState(contextSchoolYearId)
  // Reset local filters when global school year changes
  if (contextSchoolYearId !== prevContextYear) {
    setPrevContextYear(contextSchoolYearId)
    setSelectedTermId('')
    setSelectedClassId('')
  }

  const effectiveYearId = contextSchoolYearId || ''

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
        className="
          border-border/40 bg-card/30 space-y-6 rounded-3xl border p-6 shadow-xl
          backdrop-blur-xl
        "
      >
        <div className="
          grid grid-cols-1 gap-6
          md:grid-cols-2
        "
        >

          {/* Term */}
          <div className="space-y-2.5">
            <Label className="
              text-muted-foreground ml-1 text-xs font-black tracking-widest
              uppercase
            "
            >
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
                    <SelectTrigger className="
                      bg-background/50 border-border/40
                      focus:bg-background
                      h-11 rounded-xl transition-all
                    "
                    >
                      <SelectValue placeholder={t.terms.select()}>
                        {selectedTermId
                          ? (() => {
                              const selectedItem = terms?.find(term => term.id === selectedTermId)
                              return selectedItem
                                ? (
                                    <div className="flex items-center gap-2">
                                      <IconCalendar className="
                                        text-muted-foreground size-3.5
                                      "
                                      />
                                      <span className="font-semibold">{selectedItem.template.name}</span>
                                    </div>
                                  )
                                : null
                            })()
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="
                      bg-popover/90 border-border/40 rounded-xl
                      backdrop-blur-2xl
                    "
                    >
                      {terms?.map(term => (
                        <SelectItem
                          key={term.id}
                          value={term.id}
                          className="rounded-lg font-semibold"
                        >
                          {term.template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>

          {/* Class */}
          <div className="space-y-2.5">
            <Label className="
              text-muted-foreground ml-1 text-xs font-black tracking-widest
              uppercase
            "
            >
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
                    <SelectTrigger className="
                      bg-background/50 border-border/40
                      focus:bg-background
                      h-11 rounded-xl transition-all
                    "
                    >
                      <SelectValue placeholder={t.classes.select()}>
                        {selectedClassId
                          ? (() => {
                              const selectedItem = classes?.find(item => item.class.id === selectedClassId)
                              return selectedItem
                                ? (
                                    <div className="flex items-center gap-2">
                                      <IconLayoutGrid className="
                                        text-muted-foreground size-3.5
                                      "
                                      />
                                      <span className="font-semibold">
                                        {selectedItem.grade.name}
                                        {' '}
                                        {selectedItem.class.section}
                                      </span>
                                    </div>
                                  )
                                : null
                            })()
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="
                      bg-popover/90 border-border/40 rounded-xl
                      backdrop-blur-2xl
                    "
                    >
                      {classes?.map(item => (
                        <SelectItem
                          key={item.class.id}
                          value={item.class.id}
                          className="rounded-lg font-semibold"
                        >
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
          <ReportCardsToolbar
            search={search}
            setSearch={setSearch}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onRecalculate={() => recalculateMutation.mutate()}
            isRecalculating={recalculateMutation.isPending}
            onGenerateClick={() => setIsGenerationDialogOpen(true)}
          />
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
                            <div className="
                              bg-background/50 absolute inset-0 z-10 flex
                              items-center justify-center rounded-2xl
                              backdrop-blur-sm
                            "
                            >
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
              <Card className="
                border-border/60 bg-card/20 rounded-3xl border border-dashed
                backdrop-blur-sm
              "
              >
                <CardContent className="
                  flex flex-col items-center justify-center py-20 text-center
                "
                >
                  <div className="
                    bg-background/50 mb-6 rounded-full p-6 shadow-inner
                  "
                  >
                    <IconSchool className="text-muted-foreground/20 size-16" />
                  </div>
                  <h3 className="text-muted-foreground mb-2 text-xl font-bold">{t.reportCards.selectFiltersPrompt()}</h3>
                  <p className="text-muted-foreground max-w-xs text-sm">{t.academic.grades.statistics.description()}</p>
                </CardContent>
              </Card>
            )}
      </motion.div>

      <BulkGenerationDialog
        open={isGenerationDialogOpen}
        onOpenChange={setIsGenerationDialogOpen}
        students={mappedStudents}
        className={currentClass
          ? `
            ${currentClass.grade.name}
            ${currentClass.class.section}
          `
          : ''}
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
