import { Suspense } from 'react'
import { StudentsListDialogs } from './students-list/students-list-dialogs'
import { StudentsListHeader } from './students-list/students-list-header'
import { StudentsListPagination } from './students-list/students-list-pagination'
import { StudentsListProvider } from './students-list/students-list-provider'
import { StudentsListTable } from './students-list/students-list-table'

export function StudentsList() {
  return (
    <StudentsListProvider>
      <div className="space-y-6">
        <StudentsListHeader />
        <StudentsListTable />
        <StudentsListPagination />
        <Suspense fallback={null}>
          <StudentsListDialogs />
        </Suspense>
      </div>
    </StudentsListProvider>
  )
}
