import { lazy, Suspense } from 'react'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { useClassesTable } from './classes-table-context'
import { ClassesTableFilters } from './classes-table-filters'
import { ClassesTablePagination } from './classes-table-pagination'
import { ClassesTableProvider } from './classes-table-provider'

const ClassesTableDesktop = lazy(() => import('./classes-table-desktop').then(m => ({ default: m.ClassesTableDesktop })))
const ClassesTableMobile = lazy(() => import('./classes-table-mobile').then(m => ({ default: m.ClassesTableMobile })))
const ClassesTableDialogs = lazy(() => import('./classes-table-dialogs').then(m => ({ default: m.ClassesTableDialogs })))

interface ClassesTableProps {
  filters?: {
    search?: string
    status?: string
  }
}

export function ClassesTable({ filters }: ClassesTableProps) {
  return (
    <ClassesTableProvider initialFilters={filters}>
      <ClassesTableContent />
    </ClassesTableProvider>
  )
}

function ClassesTableContent() {
  const { state } = useClassesTable()

  if (state.isPending) {
    return <TableSkeleton columns={6} rows={5} />
  }

  return (
    <div className="space-y-6">
      <ClassesTableFilters />
      <Suspense fallback={<TableSkeleton columns={6} rows={5} />}>
        <ClassesTableMobile />
        <ClassesTableDesktop />
      </Suspense>
      <ClassesTablePagination />
      <Suspense fallback={null}>
        <ClassesTableDialogs />
      </Suspense>
    </div>
  )
}
