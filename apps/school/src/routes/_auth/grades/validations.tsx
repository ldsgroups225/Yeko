import type { PendingValidation } from '@repo/data-ops/index'
import {
  IconCalendar,
  IconCircleCheck,
  IconCircleX,
  IconClipboardCheck,
  IconDots,
  IconFileText,
  IconFilter,
  IconNotebook,
  IconSearch,
  IconUser,
  IconX,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { GradeValidationDialog } from '@/components/grades'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useSchoolContext } from '@/hooks/use-school-context'
import { useTranslations } from '@/i18n'
import { authClient } from '@/lib/auth-client'
import { gradesKeys, gradesOptions } from '@/lib/queries/grades'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { cn } from '@/lib/utils'
import {
  getSubmittedGradeIds,
  rejectGrades,
  validateGrades,
} from '@/school/functions/student-grades'
import { getUserIdFromAuthUserId } from '@/school/functions/users'
import { generateUUID } from '@/utils/generateUUID'

// Student grade type from the database
interface StudentGrade {
  id: string
  studentId: string
  value: string
  type: string
  gradeDate: Date
  status: string
  student: {
    id: string
    firstName: string
    lastName: string
    matricule: string | null
  }
}

// Grade type for UI display
type GradeType = 'quiz' | 'test' | 'exam' | 'participation' | 'homework' | 'project'

// Grade type mapping with proper typing
const GRADE_TYPE_LABELS: Record<GradeType, string> = {
  quiz: 'Interrogation',
  test: 'Devoir',
  exam: 'Examen',
  participation: 'Participation',
  homework: 'Devoir Maison',
  project: 'Projet',
} as const

export const Route = createFileRoute('/_auth/grades/validations')({
  component: GradeValidationsPage,
})

function GradeValidationsPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolId, isPending: contextPending } = useSchoolContext()
  const session = authClient.useSession()
  const userId = session.data?.user?.id
  const [selectedValidation, setSelectedValidation]
    = useState<PendingValidation | null>(null)
  const [dialogMode, setDialogMode] = useState<'validate' | 'reject'>(
    'validate',
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [detailValidation, setDetailValidation] = useState<PendingValidation | null>(null)

  const { data: pendingValidationsResult, isPending } = useQuery(
    gradesOptions.pending(schoolId ?? ''),
  )

  const pendingValidations = pendingValidationsResult || []

  const validateMutation = useMutation({
    mutationKey: schoolMutationKeys.grades.validate,
    mutationFn: (params: {
      gradeIds: string[]
      userId: string
      comment?: string
    }) => validateGrades({ data: params }),
    onSuccess: () => {
      const pendingKey = schoolId ? gradesKeys.pending(schoolId) : gradesKeys.all
      queryClient.invalidateQueries({ queryKey: pendingKey })
      setDialogOpen(false)
      setSelectedValidation(null)
      setSelectedRows([])
      toast.success(t.academic.grades.validations.validateSuccess())
    },
    onError: () => {
      toast.error(t.academic.grades.errors.saveError())
    },
  })

  const rejectMutation = useMutation({
    mutationKey: schoolMutationKeys.grades.reject,
    mutationFn: (params: {
      gradeIds: string[]
      userId: string
      reason: string
    }) => rejectGrades({ data: params }),
    onSuccess: () => {
      const pendingKey = schoolId ? gradesKeys.pending(schoolId) : gradesKeys.all
      queryClient.invalidateQueries({ queryKey: pendingKey })
      setDialogOpen(false)
      setSelectedValidation(null)
      setSelectedRows([])
      toast.success(t.academic.grades.validations.rejectSuccess())
    },
    onError: () => {
      toast.error(t.academic.grades.errors.saveError())
    },
  })

  const handleValidate = (validation: PendingValidation) => {
    setSelectedValidation(validation)
    setDialogMode('validate')
    setDialogOpen(true)
  }

  const handleReject = (validation: PendingValidation) => {
    setSelectedValidation(validation)
    setDialogMode('reject')
    setDialogOpen(true)
  }

  const handleViewDetails = (validation: PendingValidation) => {
    setDetailValidation(validation)
    setIsSheetOpen(true)
  }

  const { data: studentGradesData, isPending: isLoadingGrades } = useQuery({
    ...gradesOptions.byClass({
      classId: detailValidation?.classId ?? '',
      subjectId: detailValidation?.subjectId ?? '',
      termId: detailValidation?.termId ?? '',
    }),
    enabled: !!detailValidation && isSheetOpen,
  })

  const handleBulkValidate = async () => {
    if (selectedRows.length === 0 || !userId)
      return

    setDialogMode('validate')
    setDialogOpen(true)
    // We set selectedValidation to null to indicate bulk mode
    setSelectedValidation(null)
  }

  const handleBulkReject = async () => {
    if (selectedRows.length === 0 || !userId)
      return

    setDialogMode('reject')
    setDialogOpen(true)
    // We set selectedValidation to null to indicate bulk mode
    setSelectedValidation(null)
  }

  const handleConfirm = async (reason?: string) => {
    if (!userId)
      return

    try {
      // Convert auth user ID to internal user ID
      const userResult = await getUserIdFromAuthUserId({
        data: { authUserId: userId },
      })
      if (!userResult.success || !userResult.data) {
        toast.error(t.common.error())
        return
      }
      const internalUserId = userResult.data

      let gradeIds: string[] = []

      if (selectedValidation) {
        // Individual validation
        const result = await getSubmittedGradeIds({
          data: {
            classId: selectedValidation.classId,
            subjectId: selectedValidation.subjectId,
            termId: selectedValidation.termId,
          },
        })

        if (result.success) {
          gradeIds = result.data
        }
        else {
          toast.error(typeof result.error === 'string' ? result.error : t.common.error())
          return
        }
      }
      else if (selectedRows.length > 0) {
        // Bulk validation
        const promises = selectedRows.map((rowId) => {
          const [classId, subjectId, termId] = rowId.split('__') as [
            string,
            string,
            string,
          ]
          return getSubmittedGradeIds({
            data: { classId, subjectId, termId },
          })
        })
        const results = await Promise.all(promises)

        // Filter successful results and flatten the arrays
        gradeIds = results
          .filter(r => r.success)
          .flatMap(r => r.data)

        if (results.some(r => !r.success)) {
          toast.error(t.academic.grades.errors.loadError())
        }
      }

      if (gradeIds.length === 0) {
        toast.error(t.academic.grades.validations.noValidations())
        return
      }

      if (dialogMode === 'validate') {
        validateMutation.mutate({
          gradeIds,
          userId: internalUserId,
          comment: reason,
        })
      }
      else {
        if (!reason) {
          toast.error(t.academic.grades.validations.rejectReason())
          return
        }
        rejectMutation.mutate({
          gradeIds,
          userId: internalUserId,
          reason,
        })
      }
    }
    catch {
      toast.error(t.academic.grades.errors.loadError())
    }
  }

  const isMutating = validateMutation.isPending || rejectMutation.isPending

  const filteredValidations = (
    (pendingValidations as PendingValidation[]) || []
  ).filter(
    v =>
      v.className.toLowerCase().includes(search.toLowerCase())
      || v.subjectName.toLowerCase().includes(search.toLowerCase())
      || v.teacherName.toLowerCase().includes(search.toLowerCase())
      || v.gradeName.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(
        filteredValidations.map(
          v => `${v.classId}__${v.subjectId}__${v.termId}`,
        ),
      )
    }
    else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id])
    }
    else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id))
    }
  }

  const totalPendingSelected = selectedRows.reduce((sum, rowId) => {
    const val = filteredValidations.find(
      v => `${v.classId}__${v.subjectId}__${v.termId}` === rowId,
    )
    return sum + (val?.pendingCount || 0)
  }, 0)

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: t.nav.grades(), href: '/grades' },
          { label: t.academic.grades.validations.title() },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent-foreground shadow-inner">
            <IconClipboardCheck className="size-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              {t.academic.grades.validations.title()}
            </h1>
            <p className="text-muted-foreground font-medium italic">
              {t.academic.grades.validations.description()}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/30 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between shadow-xl"
      >
        <div className="flex flex-1 gap-3">
          <div className="relative max-w-sm flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder={t.common.search()}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-11 border-border/40 bg-background/50 pl-9 transition-all focus:bg-background shadow-none rounded-xl"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground/40 hover:text-muted-foreground"
                onClick={() => setSearch('')}
              >
                <IconX className="size-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            className="h-11 px-4 border-border/40 bg-background/50 backdrop-blur-sm shadow-none hover:bg-background rounded-xl"
          >
            <IconFilter className="mr-2 h-4 w-4" />
            {t.academic.grades.filters.title()}
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {selectedRows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2"
              >
                <Badge
                  variant="secondary"
                  className="h-11 px-4 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-none font-bold"
                >
                  {selectedRows.length}
                  {' '}
                  {t.common.selected()}
                  {' '}
                  (
                  {totalPendingSelected}
                  {' '}
                  {t.academic.grades.entry.studentGrades().toLowerCase()}
                  )
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkReject}
                  className="h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm"
                >
                  <IconCircleX className="mr-1.5 size-4" />
                  {t.academic.grades.validations.reject()}
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkValidate}
                  className="h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-success hover:bg-success/90 shadow-lg shadow-success/20"
                >
                  <IconCircleCheck className="mr-1.5 size-4" />
                  {t.academic.grades.validations.validate()}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Table View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-3xl border border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl"
      >
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow className="hover:bg-transparent border-border/20">
              <TableHead className="w-[50px] pl-6">
                <Checkbox
                  checked={
                    filteredValidations.length > 0
                    && selectedRows.length === filteredValidations.length
                  }
                  onCheckedChange={checked => handleSelectAll(!!checked)}
                  className="border-primary/50 data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">
                {t.academic.grades.entry.title()}
              </TableHead>
              <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">
                {t.academic.grades.entry.subject()}
              </TableHead>
              <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">
                {t.academic.grades.validations.submittedBy()}
              </TableHead>
              <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">
                Moyenne
              </TableHead>
              <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5 text-center truncate">
                NB. ÉLÈVES
              </TableHead>
              <TableHead className="w-[100px] pr-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending || contextPending
              ? (
                  Array.from({ length: 5 }).map(() => (
                    <TableRow key={generateUUID()} className="border-border/10">
                      <TableCell className="pl-6">
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-32 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-40 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-32 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-12 mx-auto rounded-full" />
                      </TableCell>
                      <TableCell className="pr-6">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                )
              : filteredValidations.length > 0
                ? (
                    <AnimatePresence>
                      {filteredValidations.map((validation, index) => {
                        const rowId = `${validation.classId}__${validation.subjectId}__${validation.termId}`
                        return (
                          <motion.tr
                            key={rowId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-border/10 group hover:bg-primary/5 transition-colors"
                          >
                            <TableCell className="pl-6">
                              <Checkbox
                                checked={selectedRows.includes(rowId)}
                                onCheckedChange={checked =>
                                  handleSelectRow(rowId, !!checked)}
                                className="border-primary/50 data-[state=checked]:border-primary"
                              />
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  <IconFileText className="size-4" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold tracking-tight">
                                    {validation.gradeName}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="rounded-full bg-background/50 border-border/40 font-bold uppercase tracking-wider text-[10px] w-6 h-6 flex items-center justify-center p-0"
                                  >
                                    {validation.className}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-muted-foreground italic">
                              {validation.subjectName}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-linear-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                                  <IconUser className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-sm font-medium">
                                  {validation.teacherName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col items-start gap-1">
                                <span className="font-bold text-sm">
                                  {validation.average}
                                  <span className="text-muted-foreground text-xs font-normal ml-0.5">
                                    /
                                    {validation.maxGrade}
                                  </span>
                                </span>
                                <Badge variant="secondary" className="w-fit text-[10px] px-1.5 h-5 font-medium">
                                  Coef.
                                  {' '}
                                  {validation.coefficient}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-accent/10 text-accent-foreground hover:bg-accent/20 border-accent/20 font-black px-2.5 rounded-full">
                                {validation.pendingCount}
                              </Badge>
                            </TableCell>
                            <TableCell className="pr-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={(
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-background/80 ml-auto flex rounded-xl"
                                    >
                                      <IconDots className="size-4" />
                                    </Button>
                                  )}
                                />
                                <DropdownMenuContent
                                  align="end"
                                  className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40 min-w-[160px]"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleValidate(validation)}
                                    className="rounded-lg py-2 cursor-pointer"
                                  >
                                    <IconCircleCheck className="mr-2 size-4 text-success" />
                                    <span className="font-semibold">
                                      {t.academic.grades.validations.validate()}
                                    </span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleReject(validation)}
                                    className="rounded-lg py-2 cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <IconCircleX className="mr-2 size-4" />
                                    <span className="font-semibold">
                                      {t.academic.grades.validations.reject()}
                                    </span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleViewDetails(validation)}
                                    className="rounded-lg py-2 cursor-pointer border-t border-border/10 mt-1"
                                  >
                                    <IconFileText className="mr-2 size-4" />
                                    <span className="font-semibold">
                                      {t.academic.grades.validations.viewDetails()}
                                    </span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  )
                : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center opacity-40 italic">
                          <IconClipboardCheck className="size-12 mb-4" />
                          <p className="text-lg font-bold">
                            {t.academic.grades.validations.noValidations()}
                          </p>
                          <p className="text-sm font-medium">
                            {t.academic.grades.validations.allValidated()}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
          </TableBody>
        </Table>
      </motion.div>

      <GradeValidationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        gradeCount={
          selectedValidation
            ? selectedValidation.pendingCount
            : totalPendingSelected
        }
        onConfirm={handleConfirm}
        isPending={isMutating}
      />

      {/* Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="left" className="flex flex-col gap-0 p-0 sm:max-w-3xl! w-full">
          <SheetHeader className="flex flex-row items-center justify-between border-b bg-muted/10 px-6 py-4 pr-12">
            <div className="space-y-1">
              <SheetTitle className="flex items-center gap-2">
                <IconFileText className="h-5 w-5 text-primary" />
                {t.academic.grades.validations.viewDetails()}
              </SheetTitle>
              <SheetDescription>
                {detailValidation?.gradeName}
                {' '}
                -
                {detailValidation?.className}
              </SheetDescription>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                NB. ÉLÈVES
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary">{detailValidation?.pendingCount}</span>
                <span className="text-xs font-medium text-muted-foreground">{t.common.total().toLowerCase()}</span>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                {/* Unified Details Grid */}
                {/* Unified Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  {/* Column 1: Evaluation Info */}
                  <div className="flex flex-col gap-3 h-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-1 w-8 rounded-full bg-primary/20 shrink-0" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">
                        {t.academic.grades.validations.details.evaluation()}
                      </h3>
                    </div>
                    <div className="flex-1 rounded-xl border bg-card p-4 shadow-sm space-y-3">
                      <div className="grid gap-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          {t.academic.grades.entry.class()}
                        </Label>
                        <p className="text-sm font-bold truncate">
                          {detailValidation?.gradeName}
                          {' '}
                          {detailValidation?.className}
                        </p>
                      </div>

                      <div className="grid gap-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          {t.academic.grades.entry.subject()}
                        </Label>
                        <div className="flex items-center gap-2">
                          <IconNotebook className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm font-semibold italic">{detailValidation?.subjectName}</p>
                        </div>
                      </div>

                      <div className="grid gap-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Type d'évaluation
                        </Label>
                        <div className="flex items-center gap-2">
                          <IconFileText className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm font-semibold">
                            {studentGradesData?.[0]?.type
                              ? (GRADE_TYPE_LABELS[studentGradesData[0].type as GradeType] || studentGradesData[0].type)
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Submission Info */}
                  <div className="flex flex-col gap-3 h-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-1 w-8 rounded-full bg-primary/20 shrink-0" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">
                        {t.academic.grades.validations.details.submission()}
                      </h3>
                    </div>
                    <div className="flex-1 rounded-xl border bg-card p-4 shadow-sm space-y-3">
                      <div className="grid gap-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          {t.academic.grades.validations.submittedBy()}
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <IconUser className="h-3 w-3 text-primary" />
                          </div>
                          <p className="text-sm font-bold truncate">{detailValidation?.teacherName}</p>
                        </div>
                      </div>

                      <div className="grid gap-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          {t.academic.grades.validations.submittedAt()}
                        </Label>
                        <div className="flex items-center gap-2">
                          <IconCalendar className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {detailValidation?.submittedAt
                              ? new Date(detailValidation.submittedAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Stats */}
                  <div className="flex flex-col gap-3 h-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-1 w-8 rounded-full bg-primary/20 shrink-0" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">
                        {t.academic.grades.validations.details.stats()}
                      </h3>
                    </div>
                    <div className="flex-1 rounded-xl border bg-card p-4 shadow-sm flex flex-col justify-between gap-4">
                      <div className="flex flex-1 items-center justify-center text-center">
                        <div>
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2">
                            Moyenne
                          </Label>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-black text-primary tracking-tight">{detailValidation?.average}</span>
                            <span className="text-sm font-bold text-muted-foreground">
                              /
                              {detailValidation?.maxGrade}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 bg-muted/20 -mx-4 -mb-4 px-4 py-3 mt-auto">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">Coefficient</span>
                          <span className="text-sm font-black">{detailValidation?.coefficient}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">Note sur</span>
                          <span className="text-sm font-black">{detailValidation?.maxGrade}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Grades Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-8 rounded-full bg-primary/20" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Notes des élèves
                    </h3>
                  </div>
                  <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    {isLoadingGrades
                      ? (
                          <div className="p-4 space-y-2">
                            {[1, 2, 3, 4, 5].map(item => (
                              <Skeleton key={item} className="h-10 w-full" />
                            ))}
                          </div>
                        )
                      : studentGradesData && studentGradesData.length > 0
                        ? (
                            <Table>
                              <TableHeader className="bg-muted/20">
                                <TableRow>
                                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-6">
                                    Élève
                                  </TableHead>
                                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center w-32 pr-6">
                                    Note
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {studentGradesData.map((grade: StudentGrade) => (
                                  <TableRow key={grade.id} className="border-border/10">
                                    <TableCell className="pl-6">
                                      <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                          <IconUser className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-bold">
                                          {grade.student?.firstName}
                                          {' '}
                                          {grade.student?.lastName}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center pr-6">
                                      <Badge
                                        variant="secondary"
                                        className={cn(
                                          'font-black text-sm px-3 py-1',
                                          Number(grade.value) < 10 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
                                        )}
                                      >
                                        {Number(grade.value).toFixed(2)}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )
                        : (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                              Aucune note trouvée pour cette validation.
                            </div>
                          )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-end gap-3 border-t bg-muted/10 px-6 py-4">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsSheetOpen(false)}>
                {t.common.close()}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm"
                  onClick={() => {
                    if (detailValidation) {
                      setIsSheetOpen(false)
                      handleReject(detailValidation)
                    }
                  }}
                >
                  <IconCircleX className="mr-2 size-4" />
                  {t.academic.grades.validations.reject()}
                </Button>
                <Button
                  variant="default"
                  className="rounded-xl bg-success hover:bg-success/90 shadow-lg shadow-success/20"
                  onClick={() => {
                    if (detailValidation) {
                      setIsSheetOpen(false)
                      handleValidate(detailValidation)
                    }
                  }}
                >
                  <IconCircleCheck className="mr-2 size-4" />
                  {t.academic.grades.validations.validate()}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
