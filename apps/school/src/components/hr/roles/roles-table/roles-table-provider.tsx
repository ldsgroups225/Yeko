import type { RolesFilters } from './types'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { getRoles } from '@/school/functions/roles'
import { RolesTableContext } from './roles-table-context'

interface RolesTableProviderProps {
  children: React.ReactNode
  filters: RolesFilters
}

export function RolesTableProvider({ children, filters }: RolesTableProviderProps) {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 500)

  const { data, isPending } = useQuery({
    queryKey: ['roles', { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const result = await getRoles({
        data: {
          filters: {
            search: debouncedSearch,
            scope: filters.scope,
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

  const rolesData = data?.success ? data.data : undefined

  return (
    <RolesTableContext
      value={{
        state: {
          filters,
          searchInput,
          isPending,
          rolesData,
        },
        actions: {
          setSearchInput,
          handlePageChange: (page: number) => {
            navigate({
              to: '/settings/roles',
              search: { ...filters, page },
            })
          },
        },
      }}
    >
      {children}
    </RolesTableContext>
  )
}
