import type { EnrollmentWithDetails } from '@repo/data-ops/queries/enrollments'
import {
  IconClipboardCheck,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/hr/empty-state'
import { useDebounce } from '@/hooks/use-debounce'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { classesOptions } from '@/lib/queries/classes'
import { enrollmentsKeys, enrollmentsOptions } from '@/lib/queries/enrollments'
import { schoolMutationKeys } from '@/lib/queries/keys'
import {
  cancelEnrollment,
  confirmEnrollment,
} from '@/school/functions/enrollments'
import { generateUUID } from '@/utils/generateUUID'
import { BulkReEnrollDialog } from './bulk-reenroll-dialog'
import { EnrollmentStats } from './enrollment-stats'
import { EnrollmentCancelDialog } from './enrollments/enrollment-cancel-dialog'
import { EnrollmentFilters } from './enrollments/enrollment-filters'
import { EnrollmentTableRow } from './enrollments/enrollment-table-row'

export function EnrollmentsList() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolYearId } = useSchoolYearContext()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'transferred'>('all')
  const [classId, setClassId] = useState<string>('all')
  const [page, setPage] = useState(1)

  const [bulkReEnrollOpen, setBulkReEnrollOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithDetails | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const debouncedSearch = useDebounce(search, 500)

  const [prevSchoolYearId, setPrevSchoolYearId] = useState(schoolYearId)

  if (schoolYearId !== prevSchoolYearId) {
    setPrevSchoolYearId(schoolYearId)
    setClassId('all')
    setPage(1)
  }

  const filters = useMemo(() => ({
    schoolYearId: schoolYearId || undefined,
    classId: classId === 'all' ? undefined : classId,
    status: status === 'all' ? undefined : status,
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  }), [schoolYearId, classId, status, debouncedSearch, page])

  const { data, isPending } = useQuery(enrollmentsOptions.list(filters))
  const { data: classesData } = useQuery({
    ...classesOptions.list({ schoolYearId: schoolYearId || undefined }),
    enabled: !!schoolYearId,
  })

  const confirmMutation = useMutation({
    mutationKey: schoolMutationKeys.enrollments.confirm,
    mutationFn: (id: string) => confirmEnrollment({ data: id }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: enrollmentsKeys.all })
        toast.success(t.enrollments.confirmSuccess())
      }
      else {
        toast.error(result.error)
      }
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const cancelMutation = useMutation({
    mutationKey: schoolMutationKeys.enrollments.cancel,
    mutationFn: (data: { id: string, reason?: string }) => cancelEnrollment({ data }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: enrollmentsKeys.all })
        toast.success(t.enrollments.cancelSuccess())
        setCancelDialogOpen(false)
        setSelectedEnrollment(null)
        setCancelReason('')
      }
      else {
        toast.error(result.error)
      }
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <div className="space-y-6">
      {schoolYearId && <EnrollmentStats />}

      <EnrollmentFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={val => setStatus(val)}
        classId={classId}
        onClassChange={setClassId}
        classesData={classesData}
        onBulkReEnroll={() => setBulkReEnrollOpen(true)}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t.enrollments.list()}</CardTitle>
          <CardDescription>{t.enrollments.listDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.enrollments.student()}</TableHead>
                <TableHead>{t.enrollments.class()}</TableHead>
                <TableHead>{t.enrollments.enrollmentDate()}</TableHead>
                <TableHead>{t.enrollments.rollNumber()}</TableHead>
                <TableHead>{t.enrollments.status()}</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending
                ? (
                    Array.from({ length: 5 }).map(() => (
                      <TableRow key={generateUUID()}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  )
                : data?.data?.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <EmptyState
                            icon={IconClipboardCheck}
                            title={t.enrollments.noEnrollments()}
                            description={t.enrollments.noEnrollmentsDescription()}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : (
                      data?.data?.map((item, index) => (
                        <EnrollmentTableRow
                          key={item.enrollment.id}
                          item={item}
                          index={index}
                          onConfirm={confirmMutation.mutate}
                          onCancel={(e) => {
                            setSelectedEnrollment(e)
                            setCancelDialogOpen(true)
                          }}
                          isConfirming={confirmMutation.isPending}
                        />
                      ))
                    )}
            </TableBody>
          </Table>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {t.common.showing()}
                {' '}
                {(page - 1) * 20 + 1}
                -
                {Math.min(page * 20, data.total)}
                {' '}
                {t.common.of()}
                {' '}
                {data.total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{t.common.previous()}</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>{t.common.next()}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BulkReEnrollDialog open={bulkReEnrollOpen} onOpenChange={setBulkReEnrollOpen} />

      <EnrollmentCancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        enrollment={selectedEnrollment}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={() => selectedEnrollment && cancelMutation.mutate({ id: selectedEnrollment.enrollment.id, reason: cancelReason || undefined })}
        isPending={cancelMutation.isPending}
      />
    </div>
  )
}
