'use client'

import type { StudentFilters } from '@/lib/queries/students'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  UserX,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import { Button } from '@/components/ui/button'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDebounce } from '@/hooks/use-debounce'
import { studentsKeys, studentsOptions } from '@/lib/queries/students'
import { deleteStudent, updateStudentStatus } from '@/school/functions/students'

import { StudentStatusDialog } from './student-status-dialog'

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  graduated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  transferred: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  withdrawn: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

type StudentStatus = 'active' | 'graduated' | 'transferred' | 'withdrawn'

export function StudentsList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [page, setPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  const filters: StudentFilters = {
    search: debouncedSearch || undefined,
    status: status as StudentFilters['status'] || undefined,
    gender: gender as StudentFilters['gender'] || undefined,
    page,
    limit: 20,
  }

  const { data, isLoading, error } = useQuery(studentsOptions.list(filters))

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStudent({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t('students.deleteSuccess'))
      setDeleteDialogOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const statusMutation = useMutation({
    mutationFn: (input: { id: string, status: StudentStatus, reason?: string }) =>
      updateStudentStatus({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t('students.statusUpdateSuccess'))
      setStatusDialogOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleDelete = (student: any) => {
    setSelectedStudent(student)
    setDeleteDialogOpen(true)
  }

  const handleStatusChange = (student: any) => {
    setSelectedStudent(student)
    setStatusDialogOpen(true)
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{t('common.error')}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: studentsKeys.all })} className="mt-6">
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('students.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('students.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="active">{t('students.statusActive')}</SelectItem>
              <SelectItem value="graduated">{t('students.statusGraduated')}</SelectItem>
              <SelectItem value="transferred">{t('students.statusTransferred')}</SelectItem>
              <SelectItem value="withdrawn">{t('students.statusWithdrawn')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t('students.gender')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="M">{t('students.male')}</SelectItem>
              <SelectItem value="F">{t('students.female')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            {t('common.import')}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('common.export')}
          </Button>
          <Button size="sm" onClick={() => navigate({ to: '/app/students/new' })}>
            <Plus className="mr-2 h-4 w-4" />
            {t('students.addStudent')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">{t('students.student')}</TableHead>
              <TableHead>{t('students.matricule')}</TableHead>
              <TableHead>{t('students.class')}</TableHead>
              <TableHead>{t('students.gender')}</TableHead>
              <TableHead>{t('students.status')}</TableHead>
              <TableHead>{t('students.parents')}</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                )
              : data?.data.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">{t('students.noStudents')}</h3>
                          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t('students.noStudentsDescription')}</p>
                          <Button onClick={() => navigate({ to: '/app/students/new' })} className="mt-6">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('students.addStudent')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                : (
                    <AnimatePresence>
                      {data?.data.map((item: any, index: number) => (
                        <motion.tr
                          key={item.student.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={item.student.photoUrl || undefined} />
                                <AvatarFallback>
                                  {item.student.firstName[0]}
                                  {item.student.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <Link
                                  to="/app/students/$studentId"
                                  params={{ studentId: item.student.id }}
                                  className="font-medium hover:underline"
                                >
                                  {item.student.lastName}
                                  {' '}
                                  {item.student.firstName}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(item.student.dob).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{item.student.matricule}</TableCell>
                          <TableCell>
                            {item.currentClass
                              ? (
                                  <span>
                                    {item.currentClass.gradeName}
                                    {' '}
                                    {item.currentClass.section}
                                    {item.currentClass.seriesName && ` (${item.currentClass.seriesName})`}
                                  </span>
                                )
                              : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                          </TableCell>
                          <TableCell>
                            {item.student.gender === 'M'
                              ? t('students.male')
                              : item.student.gender === 'F'
                                ? t('students.female')
                                : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[item.student.status as keyof typeof statusColors]}>
                              {t(`students.status${item.student.status.charAt(0).toUpperCase() + item.student.status.slice(1)}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.parentsCount}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to="/app/students/$studentId" params={{ studentId: item.student.id }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t('common.view')}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to="/app/students/$studentId/edit" params={{ studentId: item.student.id }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('common.edit')}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(item)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t('students.changeStatus')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(item)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('common.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            {t('common.previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('common.pageOf', { current: page, total: data.totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            {t('common.next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('students.deleteTitle')}
        description={t('students.deleteDescription', {
          name: `${selectedStudent?.student.firstName} ${selectedStudent?.student.lastName}`,
        })}
        onConfirm={() => deleteMutation.mutate(selectedStudent?.student.id)}
        isLoading={deleteMutation.isPending}
      />

      {/* Status Change Dialog */}
      <StudentStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        student={selectedStudent?.student}
        onConfirm={(newStatus, reason) =>
          statusMutation.mutate({ id: selectedStudent?.student.id, status: newStatus as StudentStatus, reason })}
        isLoading={statusMutation.isPending}
      />
    </div>
  )
}
