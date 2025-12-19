'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Check,
  ClipboardCheck,
  MoreHorizontal,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { EmptyState } from '@/components/hr/empty-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useDebounce } from '@/hooks/use-debounce'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { classesOptions } from '@/lib/queries/classes'
import { enrollmentsKeys, enrollmentsOptions } from '@/lib/queries/enrollments'
import { cancelEnrollment, confirmEnrollment } from '@/school/functions/enrollments'

import { generateUUID } from '@/utils/generateUUID'
import { BulkReEnrollDialog } from './bulk-reenroll-dialog'
import { EnrollmentStats } from './enrollment-stats'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  transferred: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
}

export function EnrollmentsList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { schoolYearId } = useSchoolYearContext()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [classId, setClassId] = useState<string>('all')
  const [page, setPage] = useState(1)

  const [bulkReEnrollOpen, setBulkReEnrollOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')

  const debouncedSearch = useDebounce(search, 500)

  const filters = useMemo(() => ({
    schoolYearId: schoolYearId || undefined,
    classId: classId === 'all' ? undefined : classId,
    status: status === 'all' ? undefined : status,
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  }), [schoolYearId, classId, status, debouncedSearch, page])

  const { data, isLoading } = useQuery(enrollmentsOptions.list(filters))

  const { data: classesData } = useQuery({
    ...classesOptions.list({ schoolYearId: schoolYearId || undefined }),
    enabled: !!schoolYearId,
  })

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmEnrollment({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKeys.all })
      toast.success(t('enrollments.confirmSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (data: { id: string, reason?: string }) =>
      cancelEnrollment({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKeys.all })
      toast.success(t('enrollments.cancelSuccess'))
      setCancelDialogOpen(false)
      setSelectedEnrollment(null)
      setCancelReason('')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleCancel = (enrollment: any) => {
    setSelectedEnrollment(enrollment)
    setCancelDialogOpen(true)
  }

  const handleConfirmCancel = () => {
    if (selectedEnrollment) {
      cancelMutation.mutate({
        id: selectedEnrollment.enrollment.id,
        reason: cancelReason || undefined,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {schoolYearId && <EnrollmentStats />}

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('enrollments.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('enrollments.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="pending">{t('enrollments.statusPending')}</SelectItem>
              <SelectItem value="confirmed">{t('enrollments.statusConfirmed')}</SelectItem>
              <SelectItem value="cancelled">{t('enrollments.statusCancelled')}</SelectItem>
              <SelectItem value="transferred">{t('enrollments.statusTransferred')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('enrollments.filterByClass')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {classesData?.data?.map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.grade?.name}
                  {' '}
                  {cls.section}
                  {cls.series?.name ? ` (${cls.series.name})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkReEnrollOpen(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('students.bulkReEnroll')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('enrollments.list')}</CardTitle>
          <CardDescription>{t('enrollments.listDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('enrollments.student')}</TableHead>
                <TableHead>{t('enrollments.class')}</TableHead>
                <TableHead>{t('enrollments.enrollmentDate')}</TableHead>
                <TableHead>{t('enrollments.rollNumber')}</TableHead>
                <TableHead>{t('enrollments.status')}</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? (
                  Array.from({ length: 5 }, () => (
                    <TableRow key={`skeleton-${generateUUID()}`}>
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
                          icon={ClipboardCheck}
                          title={t('enrollments.noEnrollments')}
                          description={t('enrollments.noEnrollmentsDescription')}
                        />
                      </TableCell>
                    </TableRow>
                  )
                  : (
                    data?.data?.map((item: any, index: number) => (
                      <motion.tr
                        key={item.enrollment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={item.student?.photoUrl || undefined} />
                              <AvatarFallback>
                                {item.student?.firstName?.[0]}
                                {item.student?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                to="/students/$studentId"
                                params={{ studentId: item.student?.id }}
                                className="font-medium hover:underline"
                              >
                                {item.student?.lastName}
                                {' '}
                                {item.student?.firstName}
                              </Link>
                              <p className="text-sm text-muted-foreground font-mono">
                                {item.student?.matricule}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.class?.gradeName}
                          {' '}
                          {item.class?.section}
                          {item.class?.seriesName && (
                            <span className="text-muted-foreground">
                              {' '}
                              (
                              {item.class.seriesName}
                              )
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.enrollment.enrollmentDate
                            ? new Date(item.enrollment.enrollmentDate).toLocaleDateString('fr-FR')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {item.enrollment.rollNumber || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[item.enrollment.status]}>
                            {t(`enrollments.status${item.enrollment.status.charAt(0).toUpperCase()}${item.enrollment.status.slice(1)}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  to="/students/$studentId"
                                  params={{ studentId: item.student?.id }}
                                >
                                  {t('enrollments.viewStudent')}
                                </Link>
                              </DropdownMenuItem>
                              {item.enrollment.status === 'pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => confirmMutation.mutate(item.enrollment.id)}
                                    disabled={confirmMutation.isPending}
                                  >
                                    <Check className="mr-2 h-4 w-4 text-green-600" />
                                    {t('enrollments.confirm')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleCancel(item)}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    {t('enrollments.cancel')}
                                  </DropdownMenuItem>
                                </>
                              )}
                              {item.enrollment.status === 'confirmed' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleCancel(item)}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    {t('enrollments.cancel')}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {t('common.showing')}
                {' '}
                {((page - 1) * 20) + 1}
                -
                {Math.min(page * 20, data.total)}
                {' '}
                {t('common.of')}
                {' '}
                {data.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Re-Enroll Dialog */}
      <BulkReEnrollDialog
        open={bulkReEnrollOpen}
        onOpenChange={setBulkReEnrollOpen}
      />

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('enrollments.cancelTitle')}</DialogTitle>
            <DialogDescription>
              {t('enrollments.cancelDescription', {
                name: `${selectedEnrollment?.student?.lastName} ${selectedEnrollment?.student?.firstName}`,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('enrollments.cancelReason')}</label>
              <Textarea
                placeholder={t('enrollments.cancelReasonPlaceholder')}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
            >
              {t('enrollments.confirmCancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
