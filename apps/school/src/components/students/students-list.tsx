import type { StudentStatus } from '@repo/data-ops/drizzle/school-schema'
import type { StudentWithDetails } from '@repo/data-ops/queries/students'
import type { StudentFilters } from '@/lib/queries/students'
import { formatDate } from '@repo/data-ops'
import {
  IconAdjustmentsHorizontal,
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconDownload,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUpload,
  IconUsers,
  IconUserX,
  IconWand,
  IconX,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
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
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslations } from '@/i18n'
import { downloadExcelFile, exportStudentsToExcel } from '@/lib/excel-export'
import { studentsKeys, studentsMutations, studentsOptions } from '@/lib/queries/students'

import {
  exportStudents,
} from '@/school/functions/students'
import { generateUUID } from '@/utils/generateUUID'
import { AutoMatchDialog } from './auto-match-dialog'
import { BulkReEnrollDialog } from './bulk-reenroll-dialog'
import { ImportDialog } from './import-dialog'
import { StudentStatusDialog } from './student-status-dialog'

const statusColors = {
  active: 'bg-success/10 text-success dark:bg-success/20 dark:text-success/80',
  graduated: 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary/80',
  transferred:
    'bg-accent/10 text-accent-foreground dark:bg-accent/20 dark:text-accent-foreground/80',
  withdrawn: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/80',
}

type StudentItem = StudentWithDetails

export function StudentsList() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [page, setPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(
    null,
  )
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [reEnrollDialogOpen, setReEnrollDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [autoMatchDialogOpen, setAutoMatchDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  const filters = {
    search: debouncedSearch || undefined,
    status: (status as StudentFilters['status']) || undefined,
    gender: (gender as StudentFilters['gender']) || undefined,
    page,
    limit: 20,
  }

  const isFiltered
    = !!search
      || (!!status && status !== 'all')
      || (!!gender && gender !== 'all')

  const handleClearFilters = () => {
    setSearch('')
    setStatus('')
    setGender('')
  }

  const { data, isPending, error } = useQuery(studentsOptions.list(filters))

  const getStudentStatusLabel = (value: string) => {
    switch (value) {
      case 'active':
        return t.students.statusActive()
      case 'graduated':
        return t.students.statusGraduated()
      case 'transferred':
        return t.students.statusTransferred()
      case 'withdrawn':
        return t.students.statusWithdrawn()
      default:
        return value
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.data) {
      setSelectedRows(data.data.map((item: StudentItem) => item.student.id))
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

  const handlePrefetchStudent = (studentId: string) => {
    void queryClient.prefetchQuery(studentsOptions.detail(studentId))
  }

  // Filters are now calculated in useQuery directly to avoid hoisting issues

  const deleteMutation = useMutation({
    ...studentsMutations.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t.students.deleteSuccess())
      setDeleteDialogOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const statusMutation = useMutation({
    ...studentsMutations.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t.students.statusUpdateSuccess())
      setStatusDialogOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleDelete = (student: StudentItem) => {
    setSelectedStudent(student)
    setDeleteDialogOpen(true)
  }

  const handleStatusChange = (student: StudentItem) => {
    setSelectedStudent(student)
    setStatusDialogOpen(true)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const result = await exportStudents({ data: filters })

      if (!result.success || result.data.length === 0) {
        toast.error(t.students.noDataToExport())
        return
      }

      const exportData = result.data

      // Export to Excel with translated column names
      const excelBuffer = exportStudentsToExcel(exportData, {
        matricule: t.students.matricule(),
        lastName: t.students.lastName(),
        firstName: t.students.firstName(),
        dateOfBirth: t.students.dateOfBirth(),
        gender: t.students.gender(),
        status: t.students.status(),
        class: t.students.class(),
        series: t.students.series(),
        nationality: t.students.nationality(),
        address: t.students.address(),
        emergencyContact: t.students.emergencyContact(),
        emergencyPhone: t.students.emergencyPhone(),
        admissionDate: t.students.admissionDate(),
        sheetName: t.students.title(),
      })

      // IconDownload Excel file
      downloadExcelFile(
        excelBuffer,
        `${t.students.title()}_${new Date().toISOString().split('T')[0]}.xlsx`,
      )

      toast.success(t.students.exportSuccess())
    }
    catch (err) {
      toast.error(err instanceof Error ? err.message : t.common.error())
    }
    finally {
      setIsExporting(false)
    }
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <IconUserX className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{t.common.error()}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {error.message}
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: studentsKeys.all })}
          className="mt-6"
        >
          {t.common.retry()}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters & Actions - Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-1 gap-3">
          <div className="relative max-w-sm flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.students.searchPlaceholder()}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border-border/40 bg-card/50 pl-9 transition-all focus:bg-card/80 shadow-none"
            />
          </div>

          <Popover>
            <PopoverTrigger
              render={(
                <Button
                  variant="outline"
                  className="border-border/40 bg-card/50 backdrop-blur-sm shadow-none hover:bg-card/80"
                >
                  <IconAdjustmentsHorizontal className="mr-2 h-4 w-4" />
                  {t.common.actions()}
                  {(status || gender) && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 rounded-full px-1.5 text-xs"
                    >
                      {Number(!!status) + Number(!!gender)}
                    </Badge>
                  )}
                </Button>
              )}
            />
            <PopoverContent
              className="w-80 p-4 space-y-4 backdrop-blur-2xl bg-popover/90 border border-border/40"
              align="start"
            >
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-muted-foreground text-xs mb-3 uppercase tracking-wider">
                  {t.common.filters()}
                </h4>
                <Label>{t.students.status()}</Label>
                <Select
                  value={status}
                  onValueChange={val => setStatus(val ?? '')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.students.status()}>
                      {status
                        ? (() => {
                            const statusConfig = {
                              all: { color: 'bg-gray-400', label: t.common.all(), icon: '⚫' },
                              active: { color: 'bg-emerald-500', label: t.students.statusActive(), icon: '🟢' },
                              graduated: { color: 'bg-blue-500', label: t.students.statusGraduated(), icon: '🎓' },
                              transferred: { color: 'bg-orange-500', label: t.students.statusTransferred(), icon: '↔️' },
                              withdrawn: { color: 'bg-red-500', label: t.students.statusWithdrawn(), icon: '🚫' },
                            }
                            const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.all
                            return (
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${config.color}`} />
                                <span>
                                  {config.icon}
                                  {' '}
                                  {config.label}
                                </span>
                              </div>
                            )
                          })()
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.common.all()}</SelectItem>
                    <SelectItem value="active">
                      {t.students.statusActive()}
                    </SelectItem>
                    <SelectItem value="graduated">
                      {t.students.statusGraduated()}
                    </SelectItem>
                    <SelectItem value="transferred">
                      {t.students.statusTransferred()}
                    </SelectItem>
                    <SelectItem value="withdrawn">
                      {t.students.statusWithdrawn()}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.students.gender()}</Label>
                <Select
                  value={gender}
                  onValueChange={val => setGender(val ?? '')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.students.gender()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.common.all()}</SelectItem>
                    <SelectItem value="M">{t.students.male()}</SelectItem>
                    <SelectItem value="F">{t.students.female()}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(status || gender) && (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => {
                    setStatus('')
                    setGender('')
                  }}
                >
                  {t.students.clearFilters()}
                </Button>
              )}
              <div className="pt-4 border-t border-border/40 space-y-2">
                <h4 className="font-medium leading-none text-muted-foreground text-xs mb-3 uppercase tracking-wider">
                  {t.common.quickActions()}
                </h4>
                <Button
                  variant="ghost"
                  onClick={() => setAutoMatchDialogOpen(true)}
                  className="w-full justify-start"
                >
                  <IconWand className="mr-2 h-4 w-4" />
                  {t.students.autoMatch()}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setReEnrollDialogOpen(true)}
                  className="w-full justify-start"
                >
                  <IconUsers className="mr-2 h-4 w-4" />
                  {t.students.bulkReEnroll()}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setImportDialogOpen(true)}
                  className="w-full justify-start"
                >
                  <IconUpload className="mr-2 h-4 w-4" />
                  {t.common.import()}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full justify-start"
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  {isExporting ? t.common.exporting() : t.common.export()}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10"
            >
              <IconX className="mr-2 h-4 w-4" />
              {t.students.clearFilters()}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedRows.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-none"
            >
              {selectedRows.length}
              {' '}
              {t.common.selected()}
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => navigate({ to: '/students/new' })}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            {t.students.addStudent()}
          </Button>
        </div>
      </motion.div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {isPending
          ? (
              Array.from({ length: 5 }, () => (
                <div
                  key={`card-skeleton-${generateUUID()}`}
                  className="rounded-xl border border-border/10 bg-white/30 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))
            )
          : data?.data.length === 0
            ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border/20 bg-white/30 p-8 text-center backdrop-blur-sm">
                  <IconUsers className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">
                    {t.students.noStudents()}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    {t.students.noStudentsDescription()}
                  </p>
                  <Button
                    onClick={() => navigate({ to: '/students/new' })}
                    className="mt-6"
                  >
                    <IconPlus className="mr-2 h-4 w-4" />
                    {t.students.addStudent()}
                  </Button>
                </div>
              )
            : (
                <AnimatePresence>
                  {data?.data.map((item, index: number) => (
                    <motion.div
                      key={item.student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl border border-border/40 bg-card/50 p-4 shadow-sm backdrop-blur-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedRows.includes(item.student.id)}
                            onCheckedChange={checked =>
                              handleSelectRow(item.student.id, !!checked)}
                            className="mr-2 border-primary/50 data-[state=checked]:border-primary"
                          />
                          <Link
                            to="/students/$studentId"
                            params={{ studentId: item.student.id }}
                            className="flex items-center gap-3"
                            onMouseEnter={() => handlePrefetchStudent(item.student.id)}
                          >
                            <Avatar className="h-12 w-12 border-2 border-border/20">
                              <AvatarImage src={item.student.photoUrl || undefined} />
                              <AvatarFallback>
                                {item.student.firstName[0]}
                                {item.student.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {item.student.lastName}
                                {' '}
                                {item.student.firstName}
                              </p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {item.student.matricule}
                              </p>
                            </div>
                          </Link>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={(
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-card/20"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                }}
                              >
                                <IconDots className="h-4 w-4" />
                              </Button>
                            )}
                          />
                          <DropdownMenuContent
                            align="end"
                            className="backdrop-blur-xl bg-popover/90 border border-border/40"
                          >
                            <DropdownMenuItem
                              render={(
                                <Link
                                  to="/students/$studentId/edit"
                                  params={{ studentId: item.student.id }}
                                >
                                  <IconEdit className="mr-2 h-4 w-4" />
                                  {t.common.edit()}
                                </Link>
                              )}
                            />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(item)}
                            >
                              <IconEdit className="mr-2 h-4 w-4" />
                              {t.students.changeStatus()}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item)}
                              className="text-destructive focus:text-destructive"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              {t.common.delete()}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge
                          className={`${statusColors[item.student.status as keyof typeof statusColors]} border-0 shadow-none`}
                        >
                          {getStudentStatusLabel(item.student.status)}
                        </Badge>
                        {item.currentClass?.gradeName
                          && item.currentClass?.section && (
                          <Badge
                            variant="outline"
                            className="border-border/40 bg-card/20 backdrop-blur-md"
                          >
                            {item.currentClass.gradeName}
                            {' '}
                            {item.currentClass.section}
                          </Badge>
                        )}
                        <span className="text-xs font-medium text-muted-foreground ml-auto bg-card/20 px-2 py-0.5 rounded-full">
                          {item.student.gender === 'M'
                            ? t.students.male()
                            : item.student.gender === 'F'
                              ? t.students.female()
                              : ''}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl md:block overflow-hidden">
        <Table>
          <TableHeader className="bg-card/20">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    data?.data
                    && data.data.length > 0
                    && selectedRows.length === data.data.length
                  }
                  onCheckedChange={checked => handleSelectAll(!!checked)}
                  className="border-primary/50 data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead className="w-[250px] text-foreground font-semibold">
                {t.students.student()}
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                {t.students.matricule()}
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                {t.students.class()}
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                {t.students.gender()}
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                {t.students.status()}
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                {t.students.parents()}
              </TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending
              ? (
                  Array.from({ length: 10 }, () => (
                    <TableRow
                      key={`table-skeleton-${generateUUID()}`}
                      className="border-border/10"
                    >
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                )
              : data?.data.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-96">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="rounded-full bg-white/50 p-6 backdrop-blur-xl mb-4">
                            <IconUsers className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                          <h3 className="text-lg font-semibold">
                            {t.students.noStudents()}
                          </h3>
                          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                            {t.students.noStudentsDescription()}
                          </p>
                          <Button
                            onClick={() => navigate({ to: '/students/new' })}
                            className="mt-6"
                          >
                            <IconPlus className="mr-2 h-4 w-4" />
                            {t.students.addStudent()}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                : (
                    <AnimatePresence>
                      {data?.data.map((item, index: number) => (
                        <motion.tr
                          key={item.student.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-border/10 group hover:bg-card/30 transition-colors cursor-pointer"
                          onClick={() =>
                            navigate({
                              to: '/students/$studentId',
                              params: { studentId: item.student.id },
                            })}
                          onMouseEnter={() => handlePrefetchStudent(item.student.id)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.includes(item.student.id)}
                              onCheckedChange={checked =>
                                handleSelectRow(item.student.id, !!checked)}
                              className="mr-2 border-primary/50 data-[state=checked]:border-primary"
                            />
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-border/20">
                                <AvatarImage
                                  src={item.student.photoUrl || undefined}
                                />
                                <AvatarFallback>
                                  {item.student.firstName[0]}
                                  {item.student.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <Link
                                  to="/students/$studentId"
                                  params={{ studentId: item.student.id }}
                                  className="font-medium hover:text-primary transition-colors block"
                                  onMouseEnter={() => handlePrefetchStudent(item.student.id)}
                                >
                                  {item.student.lastName}
                                  {' '}
                                  {item.student.firstName}
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(item.student.dob, 'MEDIUM')}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {item.student.matricule}
                          </TableCell>
                          <TableCell>
                            {item.currentClass?.gradeName
                              && item.currentClass?.section
                              ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-card/10 border-border/20"
                                  >
                                    {item.currentClass.gradeName}
                                    {' '}
                                    {item.currentClass.section}
                                    {item.currentClass.seriesName
                                      && ` (${item.currentClass.seriesName})`}
                                  </Badge>
                                )
                              : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                          </TableCell>
                          <TableCell>
                            {item.student.gender === 'M'
                              ? t.students.male()
                              : item.student.gender === 'F'
                                ? t.students.female()
                                : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${statusColors[item.student.status as keyof typeof statusColors]} border-0 shadow-none`}
                            >
                              {getStudentStatusLabel(item.student.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center rounded-full bg-card/20 px-2 py-0.5 text-xs font-medium w-6 h-6">
                              {item.parentsCount}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={(
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-card/20"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                    }}
                                  >
                                    <IconDots className="h-4 w-4" />
                                  </Button>
                                )}
                              />
                              <DropdownMenuContent
                                align="end"
                                className="backdrop-blur-xl bg-popover/90 border border-border/40"
                              >
                                <DropdownMenuItem
                                  render={(
                                    <Link
                                      to="/students/$studentId/edit"
                                      params={{ studentId: item.student.id }}
                                    >
                                      <IconEdit className="mr-2 h-4 w-4" />
                                      {t.common.edit()}
                                    </Link>
                                  )}
                                />
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(item)}
                                >
                                  <IconEdit className="mr-2 h-4 w-4" />
                                  {t.students.changeStatus()}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(item)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <IconTrash className="mr-2 h-4 w-4" />
                                  {t.common.delete()}
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
            <IconChevronLeft className="h-4 w-4" />
            {t.common.previous()}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t.common.pageOf({ page, totalPages: data.totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            {t.common.next()}
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t.students.deleteTitle()}
        description={t.students.deleteDescription({
          name: `${selectedStudent?.student.firstName} ${selectedStudent?.student.lastName}`,
        })}
        onConfirm={() => {
          if (selectedStudent) {
            deleteMutation.mutate(selectedStudent.student.id)
          }
        }}
        isPending={deleteMutation.isPending}
      />

      {/* Status Change Dialog */}
      <StudentStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        student={selectedStudent?.student}
        onConfirm={(newStatus, reason) =>
          selectedStudent
          && statusMutation.mutate({
            id: selectedStudent.student.id,
            status: newStatus as StudentStatus,
            reason,
          })}
        isPending={statusMutation.isPending}
      />

      {/* Bulk Re-enrollment Dialog */}
      <BulkReEnrollDialog
        open={reEnrollDialogOpen}
        onOpenChange={setReEnrollDialogOpen}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />

      {/* Auto-Match Parents Dialog */}
      <AutoMatchDialog
        open={autoMatchDialogOpen}
        onOpenChange={setAutoMatchDialogOpen}
      />
    </div>
  )
}
