import type { TeachersFilters } from './types'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { getTeachers } from '@/school/functions/teachers'
import { TeachersTableContext } from './teachers-table-context'

interface TeachersTableProviderProps {
  children: React.ReactNode
  filters: TeachersFilters
}

export function TeachersTableProvider({ children, filters }: TeachersTableProviderProps) {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 500)

  const { data, isPending } = useQuery({
    queryKey: ['teachers', { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const result = await getTeachers({
        data: {
          filters: {
            search: debouncedSearch,
            subjectId: filters.subjectId,
            status: filters.status,
          },
          pagination: {
            page: filters.page || 1,
            limit: 20,
          },
        },
      })
      return result
    },
  })

  const teachersData = data?.success ? data.data : undefined

  return (
    <TeachersTableContext
      value={{
        state: {
          filters,
          searchInput,
          isPending,
          teachersData,
        },
        actions: {
          setSearchInput,
          handlePageChange: (page: number) => {
            navigate({
              to: '/users/teachers',
              search: { ...filters, page },
            })
          },
        },
      }}
    >
      {children}
    </TeachersTableContext>
  )
}
