import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle, CheckCircle2, ClipboardCheck, FileText, Filter, MoreHorizontal, Search, User, X, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { GradeValidationDialog } from '@/components/grades'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSchoolContext } from '@/hooks/use-school-context'
import { useTranslations } from '@/i18n'
import { authClient } from '@/lib/auth-client'
import { gradesKeys, gradesOptions } from '@/lib/queries/grades'
import {
  getSubmittedGradeIds,
  rejectGrades,
  validateGrades,
} from '@/school/functions/student-grades'
import { generateUUID } from '@/utils/generateUUID'

interface PendingValidation {
  classId: string
  className: string
  gradeName: string
  subjectId: string
  subjectName: string
  termId: string
  teacherId: string
  teacherName: string
  pendingCount: number
  submittedAt: Date
}

export const Route = createFileRoute('/_auth/grades/validations')({
  component: GradeValidationsPage,
})

function GradeValidationsPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolId } = useSchoolContext()
  const session = authClient.useSession()
  const userId = session.data?.user?.id
  const [selectedValidation, setSelectedValidation] = useState<PendingValidation | null>(null)
  const [dialogMode, setDialogMode] = useState<'validate' | 'reject'>('validate')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const { data: pendingValidations, isLoading } = useQuery(
    gradesOptions.pending(schoolId ?? ''),
  )

  const validateMutation = useMutation({
    mutationFn: (params: { gradeIds: string[], userId: string, comment?: string }) =>
      validateGrades({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.all })
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
    mutationFn: (params: { gradeIds: string[], userId: string, reason: string }) =>
      rejectGrades({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.all })
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
      let gradeIds: string[] = []

      if (selectedValidation) {
        // Individual validation
        gradeIds = await getSubmittedGradeIds({
          data: {
            classId: selectedValidation.classId,
            subjectId: selectedValidation.subjectId,
            termId: selectedValidation.termId,
          },
        })
      }
      else if (selectedRows.length > 0) {
        // Bulk validation
        const promises = selectedRows.map((rowId) => {
          const [classId, subjectId, termId] = rowId.split('__') as [string, string, string]
          return getSubmittedGradeIds({
            data: { classId, subjectId, termId },
          })
        })
        const results = await Promise.all(promises)
        gradeIds = results.flat()
      }

      if (gradeIds.length === 0) {
        toast.error(t.academic.grades.validations.noValidations())
        return
      }

      if (dialogMode === 'validate') {
        validateMutation.mutate({
          gradeIds,
          userId,
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
          userId,
          reason,
        })
      }
    }
    catch {
      toast.error(t.academic.grades.errors.loadError())
    }
  }

  const isMutating = validateMutation.isPending || rejectMutation.isPending

  const filteredValidations = (pendingValidations as PendingValidation[] || []).filter(v =>
    v.className.toLowerCase().includes(search.toLowerCase())
    || v.subjectName.toLowerCase().includes(search.toLowerCase())
    || v.teacherName.toLowerCase().includes(search.toLowerCase())
    || v.gradeName.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredValidations.map(v => `${v.classId}__${v.subjectId}__${v.termId}`))
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
    const val = filteredValidations.find(v => `${v.classId}__${v.subjectId}__${v.termId}` === rowId)
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
            <ClipboardCheck className="size-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{t.academic.grades.validations.title()}</h1>
            <p className="text-muted-foreground font-medium italic">{t.academic.grades.validations.description()}</p>
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
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
                <X className="size-4" />
              </Button>
            )}
          </div>

          <Button variant="outline" className="h-11 px-4 border-border/40 bg-background/50 backdrop-blur-sm shadow-none hover:bg-background rounded-xl">
            <Filter className="mr-2 h-4 w-4" />
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
                <Badge variant="secondary" className="h-11 px-4 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-none font-bold">
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
                  <XCircle className="mr-1.5 size-4" />
                  {t.academic.grades.validations.reject()}
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkValidate}
                  className="h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="mr-1.5 size-4" />
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
                  checked={filteredValidations.length > 0 && selectedRows.length === filteredValidations.length}
                  onCheckedChange={checked => handleSelectAll(!!checked)}
                  className="border-primary/50 data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">{t.academic.grades.entry.title()}</TableHead>
              <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">{t.academic.grades.entry.class()}</TableHead>
              <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">{t.academic.grades.entry.subject()}</TableHead>
              <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5">{t.academic.grades.validations.submittedBy()}</TableHead>
              <TableHead className="text-xs font-black uppercase tracking-widest text-muted-foreground py-5 text-center">{t.academic.grades.entry.studentGrades()}</TableHead>
              <TableHead className="w-[100px] pr-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? (
                  Array.from({ length: 5 }).map(() => (
                    <TableRow key={generateUUID()} className="border-border/10">
                      <TableCell className="pl-6"><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-40 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-12 mx-auto rounded-full" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
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
                                onCheckedChange={checked => handleSelectRow(rowId, !!checked)}
                                className="border-primary/50 data-[state=checked]:border-primary"
                              />
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  <FileText className="size-4" />
                                </div>
                                <span className="font-bold tracking-tight">{validation.gradeName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="rounded-lg bg-background/50 border-border/40 font-bold uppercase tracking-wider text-[10px]">
                                {validation.className}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-muted-foreground italic">
                              {validation.subjectName}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-linear-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                                  <User className="size-3 text-primary" />
                                </div>
                                <span className="text-sm font-medium">{validation.teacherName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 font-black px-2.5 rounded-full">
                                {validation.pendingCount}
                              </Badge>
                            </TableCell>
                            <TableCell className="pr-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-background/80 ml-auto flex rounded-xl">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40 min-w-[160px]">
                                  <DropdownMenuItem onClick={() => handleValidate(validation)} className="rounded-lg py-2 cursor-pointer">
                                    <CheckCircle className="mr-2 size-4 text-emerald-500" />
                                    <span className="font-semibold">{t.academic.grades.validations.validate()}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReject(validation)} className="rounded-lg py-2 cursor-pointer text-destructive focus:text-destructive">
                                    <XCircle className="mr-2 size-4" />
                                    <span className="font-semibold">{t.academic.grades.validations.reject()}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-lg py-2 cursor-pointer border-t border-border/10 mt-1">
                                    <FileText className="mr-2 size-4" />
                                    <span className="font-semibold">{t.academic.grades.validations.viewDetails()}</span>
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
                          <ClipboardCheck className="size-12 mb-4" />
                          <p className="text-lg font-bold">{t.academic.grades.validations.noValidations()}</p>
                          <p className="text-sm font-medium">{t.academic.grades.validations.allValidated()}</p>
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
        gradeCount={selectedValidation ? selectedValidation.pendingCount : totalPendingSelected}
        onConfirm={handleConfirm}
        isLoading={isMutating}
      />
    </div>
  )
}
