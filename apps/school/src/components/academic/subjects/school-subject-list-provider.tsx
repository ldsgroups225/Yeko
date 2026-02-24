import type {
  SubjectCategoryKey,
} from './use-school-subject-columns'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import {
  schoolSubjectsKeys,
  schoolSubjectsOptions,
} from '@/lib/queries/school-subjects'
import { toggleSchoolSubjectStatus } from '@/school/functions/school-subjects'
import { SchoolSubjectListContext } from './school-subject-list-context'
import {
  SUBJECT_CATEGORY_FILTER_MAP,
  useSchoolSubjectColumns,
} from './use-school-subject-columns'

interface SchoolSubjectListProviderProps {
  children: React.ReactNode
  schoolYearId?: string
}

export function SchoolSubjectListProvider({
  children,
  schoolYearId,
}: SchoolSubjectListProviderProps) {
  const t = useTranslations()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pickerOpen, setPickerOpen] = useState(false)
  const queryClient = useQueryClient()

  const filters = {
    schoolYearId,
    search: search || undefined,
    category:
      categoryFilter !== 'all'
        ? SUBJECT_CATEGORY_FILTER_MAP[categoryFilter as SubjectCategoryKey]
        : undefined,
    status:
      statusFilter !== 'all'
        ? (statusFilter as 'active' | 'inactive')
        : undefined,
  }

  const { data: result, isPending } = useQuery(
    schoolSubjectsOptions.list(filters),
  )

  const toggleStatusMutation = useMutation({
    mutationKey: schoolMutationKeys.schoolSubjects.toggleStatus,
    mutationFn: (params: { id: string, status: 'active' | 'inactive' }) =>
      toggleSchoolSubjectStatus({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolSubjectsKeys.all })
      toast.success(t.academic.subjects.messages.statusUpdated())
    },
    onError: () => {
      toast.error(t.academic.subjects.messages.statusError())
    },
  })

  const subjectsData = useMemo(() => result?.subjects || [], [result])

  const columns = useSchoolSubjectColumns({
    toggleStatus: (id, status) => toggleStatusMutation.mutate({ id, status }),
    isPending: toggleStatusMutation.isPending,
  })

  const table = useReactTable({
    data: subjectsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const isFiltered = !!search || categoryFilter !== 'all' || statusFilter !== 'all'

  const handleClearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  const contextValue = {
    state: {
      search,
      categoryFilter,
      statusFilter,
      pickerOpen,
      isPending,
      isFiltered,
      subjectsData,
      table,
      schoolYearId,
    },
    actions: {
      setSearch,
      setCategoryFilter,
      setStatusFilter,
      setPickerOpen,
      handleClearFilters,
      toggleStatus: (id: string, status: 'active' | 'inactive') =>
        toggleStatusMutation.mutate({ id, status }),
    },
  }

  return (
    <SchoolSubjectListContext value={contextValue}>
      {children}
    </SchoolSubjectListContext>
  )
}
