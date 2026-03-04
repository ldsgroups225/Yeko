import type { ClassesTableContextValue } from './classes-table-context'
import type { ClassItem } from './types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { invalidateAll, rollback, snapshotAndUpdate } from '@/lib/mutations'
import { classesKeys, classesOptions } from '@/lib/queries/classes'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { deleteClass } from '@/school/functions/classes'
import { ClassesTableContext } from './classes-table-context'
import { useClassesTableColumns } from './use-classes-table-columns'

interface ClassesTableProviderProps {
  children: React.ReactNode
  initialFilters?: {
    search?: string
    status?: string
  }
}

export function ClassesTableProvider({
  children,
  initialFilters = {},
}: ClassesTableProviderProps) {
  const t = useTranslations()
  const { schoolYearId } = useSchoolYearContext()
  const [searchInput, setSearchInput] = useState(initialFilters.search || '')
  const [status, setStatus] = useState<string>(initialFilters.status || '')
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null)
  const [classToEdit, setClassToEdit] = useState<ClassItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const debouncedSearch = useDebounce(searchInput, 500)

  const isFiltered = !!searchInput || (!!status && status !== 'all')

  const handleClearFilters = () => {
    setSearchInput('')
    setStatus('')
  }

  const statusFilter = status && status !== 'all'
    ? status as 'active' | 'archived'
    : undefined

  const { data, isPending, refetch } = useQuery(
    classesOptions.list({
      search: debouncedSearch,
      status: statusFilter,
      schoolYearId: schoolYearId || undefined,
    }),
  )

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && data) {
        setSelectedRows(data.map(item => item.class.id))
      }
      else {
        setSelectedRows([])
      }
    },
    [data],
  )

  const handleSelectRow = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id])
    }
    else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id))
    }
  }, [])

  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.classes.delete,
    mutationFn: (id: string) => deleteClass({ data: id }),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: classesKeys.all })
      return snapshotAndUpdate<unknown[]>(
        queryClient,
        classesKeys.all,
        old => old.filter((c: any) => (c.class?.id ?? c.id) !== id),
      )
    },
    onSuccess: () => {
      toast.success(t.common.deleteSuccess())
      if (classToDelete) {
        setSelectedRows(prev =>
          prev.filter(id => id !== classToDelete.class.id),
        )
      }
      setClassToDelete(null)
    },
    onError: (_err, _vars, context) => {
      rollback(queryClient, context)
      toast.error(t.common.error())
    },
    onSettled: () => invalidateAll(queryClient, [classesKeys.all]),
  })

  const handleDelete = () => {
    if (!classToDelete)
      return
    deleteMutation.mutate(classToDelete.class.id)
  }

  const columns = useClassesTableColumns({
    selectedRows,
    handleSelectAll,
    handleSelectRow,
    setClassToEdit,
    setIsEditDialogOpen,
    setClassToDelete,
  })

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const contextValue: ClassesTableContextValue = {
    state: {
      searchInput,
      status,
      selectedRows,
      isAddDialogOpen,
      isEditDialogOpen,
      classToDelete,
      classToEdit,
      data: data || [],
      isPending,
      table,
      isFiltered,
    },
    actions: {
      setSearchInput,
      setStatus,
      setSelectedRows,
      setIsAddDialogOpen,
      setIsEditDialogOpen,
      setClassToDelete,
      setClassToEdit,
      handleDelete,
      handleSelectAll,
      handleSelectRow,
      handleClearFilters,
      refetch,
    },
  }

  return (
    <ClassesTableContext value={contextValue}>
      {children}
    </ClassesTableContext>
  )
}
