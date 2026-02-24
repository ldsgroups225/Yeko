import type { StaffFilters } from './types'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { getStaffList } from '@/school/functions/staff'
import { StaffTableContext } from './staff-table-context'

interface StaffTableProviderProps {
  children: React.ReactNode
  filters: StaffFilters
}

export function StaffTableProvider({ children, filters }: StaffTableProviderProps) {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 500)

  const { data: result, isPending } = useQuery({
    queryKey: ['staff', { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const result = await getStaffList({
        data: {
          filters: {
            search: debouncedSearch,
            position: filters.position,
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

  const staffData = result?.success ? result.data : undefined

  return (
    <StaffTableContext
      value={{
        state: {
          filters,
          searchInput,
          isPending,
          staffData,
        },
        actions: {
          setSearchInput,
          handlePageChange: (page: number) => {
            navigate({
              to: '/users/staff',
              search: { ...filters, page },
            })
          },
        },
      }}
    >
      {children}
    </StaffTableContext>
  )
}
