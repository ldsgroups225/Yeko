import { lazy, Suspense } from 'react'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { useSchoolSubjectList } from './school-subject-list-context'
import { SchoolSubjectListFilters } from './school-subject-list-filters'
import { SchoolSubjectListPagination } from './school-subject-list-pagination'
import { SchoolSubjectListProvider } from './school-subject-list-provider'
import { SubjectPickerDialog } from './subject-picker-dialog'

const SchoolSubjectListDesktop = lazy(() => import('./school-subject-list-desktop').then(m => ({ default: m.SchoolSubjectListDesktop })))
const SchoolSubjectListMobile = lazy(() => import('./school-subject-list-mobile').then(m => ({ default: m.SchoolSubjectListMobile })))

interface SchoolSubjectListProps {
  schoolYearId?: string
}

export function SchoolSubjectList({ schoolYearId }: SchoolSubjectListProps) {
  return (
    <SchoolSubjectListProvider schoolYearId={schoolYearId}>
      <SchoolSubjectListContent />
    </SchoolSubjectListProvider>
  )
}

function SchoolSubjectListContent() {
  const { state, actions } = useSchoolSubjectList()
  const { isPending, pickerOpen, schoolYearId } = state
  const { setPickerOpen } = actions

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full animate-pulse rounded-2xl bg-white/5" />
        <TableSkeleton columns={3} rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SchoolSubjectListFilters />

      <Suspense fallback={<TableSkeleton columns={3} rows={5} />}>
        <SchoolSubjectListMobile />
        <SchoolSubjectListDesktop />
      </Suspense>

      <SchoolSubjectListPagination />

      <SubjectPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        schoolYearId={schoolYearId}
      />
    </div>
  )
}
