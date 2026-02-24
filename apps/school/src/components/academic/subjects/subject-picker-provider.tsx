import type { CoreSubject } from './subject-picker-context'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import {
  schoolSubjectsKeys,
  schoolSubjectsOptions,
} from '@/lib/queries/school-subjects'
import { addSubjectsToSchool } from '@/school/functions/school-subjects'
import { SubjectPickerContext } from './subject-picker-context'

interface SubjectPickerProviderProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolYearId?: string
}

export function SubjectPickerProvider({
  children,
  open,
  onOpenChange,
  schoolYearId,
}: SubjectPickerProviderProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>())

  const { data: result, isPending } = useQuery({
    ...schoolSubjectsOptions.available({
      search: search || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      schoolYearId,
    }),
    enabled: open,
  })

  const subjects: CoreSubject[] = result || []

  const addMutation = useMutation({
    mutationKey: schoolMutationKeys.schoolSubjects.import,
    mutationFn: (subjectIds: string[]) =>
      addSubjectsToSchool({
        data: {
          subjectIds,
          schoolYearId,
        },
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(t.academic.subjects.messages.addError())
        return
      }
      queryClient.invalidateQueries({ queryKey: schoolSubjectsKeys.all })
      toast.success(
        t.academic.subjects.messages.addSuccess({ count: result.data.length }),
      )
      setSelectedIds(new Set())
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t.academic.subjects.messages.addError())
    },
  })

  const toggleSubject = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id))
        next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllInCategory = (category: string) => {
    const categorySubjects = subjects.filter(s => s.category === category)
    const allSelected = categorySubjects.every(s => selectedIds.has(s.id))

    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        categorySubjects.forEach(s => next.delete(s.id))
      }
      else {
        categorySubjects.forEach(s => next.add(s.id))
      }
      return next
    })
  }

  const handleSubmit = () => {
    if (selectedIds.size === 0) {
      toast.error(t.academic.subjects.messages.selectAtLeastOne())
      return
    }
    addMutation.mutate(Array.from(selectedIds))
  }

  return (
    <SubjectPickerContext
      value={{
        state: {
          search,
          categoryFilter,
          selectedIds,
          subjects,
          isPending,
          isAdding: addMutation.isPending,
          open,
        },
        actions: {
          setSearch,
          setCategoryFilter,
          toggleSubject,
          selectAllInCategory,
          handleSubmit,
          setOpen: onOpenChange,
        },
      }}
    >
      {children}
    </SubjectPickerContext>
  )
}
