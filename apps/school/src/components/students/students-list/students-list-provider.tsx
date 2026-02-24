import type { StudentFilters, StudentItem } from './types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { downloadExcelFile, exportStudentsToExcel } from '@/lib/excel-export'
import { studentsOptions } from '@/lib/queries/students'
import { exportStudents } from '@/school/functions/students'
import { StudentsListContext } from './students-list-context'

export function StudentsListProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolYearId } = useSchoolYearContext()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [page, setPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [reEnrollDialogOpen, setReEnrollDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [autoMatchDialogOpen, setAutoMatchDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  const [prevSchoolYearId, setPrevSchoolYearId] = useState(schoolYearId)

  // Reset local filters when global school year changes
  if (schoolYearId !== prevSchoolYearId) {
    setPrevSchoolYearId(schoolYearId)
    setPage(1)
  }

  const filters: StudentFilters = {
    schoolYearId: schoolYearId || undefined,
    search: debouncedSearch || undefined,
    status: (status as any) || undefined,
    gender: (gender as any) || undefined,
    page,
    limit: 20,
  }

  const isFiltered = !!search || (!!status && status !== 'all') || (!!gender && gender !== 'all')

  const { data, isPending } = useQuery(studentsOptions.list(filters))

  const handleClearFilters = () => {
    setSearch('')
    setStatus('')
    setGender('')
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

  return (
    <StudentsListContext
      value={{
        state: {
          filters,
          search,
          status,
          gender,
          page,
          selectedStudent,
          selectedRows,
          deleteDialogOpen,
          statusDialogOpen,
          reEnrollDialogOpen,
          importDialogOpen,
          autoMatchDialogOpen,
          isExporting,
          data,
          isPending,
          isFiltered,
        },
        actions: {
          setSearch,
          setStatus,
          setGender,
          setPage,
          setSelectedStudent,
          setSelectedRows,
          setDeleteDialogOpen,
          setStatusDialogOpen,
          setReEnrollDialogOpen,
          setImportDialogOpen,
          setAutoMatchDialogOpen,
          handleClearFilters,
          handleSelectAll,
          handleSelectRow,
          handleDelete,
          handleStatusChange,
          handleExport,
          handlePrefetchStudent,
        },
      }}
    >
      {children}
    </StudentsListContext>
  )
}
