import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getStudents } from '@/school/functions/students'
import { useDebounce } from './use-debounce'
import { useSchoolContext } from './use-school-context'

export function useSearch() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const { schoolId } = useSchoolContext()

  const { data: students, isPending } = useQuery({
    queryKey: ['search-students', schoolId, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2)
        return []
      const res = await getStudents({
        data: {
          search: debouncedQuery,
          limit: 5,
          page: 1,
        },
      })
      if (!res.success)
        return []
      return res.data.data
    },
    enabled: !!schoolId && debouncedQuery.length >= 2,
    staleTime: 60 * 1000,
  })

  return {
    query,
    setQuery,
    results: {
      students: students || [],
    },
    isPending,
  }
}
