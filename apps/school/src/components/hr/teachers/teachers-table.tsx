import type { TeachersFilters } from './teachers-table/types'
import { Card, CardContent } from '@workspace/ui/components/card'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { TeachersTableContent } from './teachers-table/teachers-table-content'
import { useTeachersTable } from './teachers-table/teachers-table-context'
import { TeachersTableHeader } from './teachers-table/teachers-table-header'
import { TeachersTablePagination } from './teachers-table/teachers-table-pagination'
import { TeachersTableProvider } from './teachers-table/teachers-table-provider'

interface TeachersTableProps {
  filters: TeachersFilters
}

export function TeachersTable(props: TeachersTableProps) {
  return (
    <TeachersTableProvider {...props}>
      <TeachersTableContainer />
    </TeachersTableProvider>
  )
}

function TeachersTableContainer() {
  const { state } = useTeachersTable()
  const { isPending } = state

  if (isPending) {
    return <TableSkeleton columns={6} rows={5} />
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm overflow-hidden">
        <TeachersTableHeader />
        <CardContent>
          <TeachersTableContent />
          <TeachersTablePagination />
        </CardContent>
      </Card>
    </div>
  )
}
