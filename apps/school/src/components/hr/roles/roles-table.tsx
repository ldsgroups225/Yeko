import type { RolesFilters } from './roles-table/types'
import { Card, CardContent } from '@workspace/ui/components/card'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { RolesTableContent } from './roles-table/roles-table-content'
import { useRolesTable } from './roles-table/roles-table-context'
import { RolesTableHeader } from './roles-table/roles-table-header'
import { RolesTablePagination } from './roles-table/roles-table-pagination'
import { RolesTableProvider } from './roles-table/roles-table-provider'

interface RolesTableProps {
  filters: RolesFilters
}

export function RolesTable(props: RolesTableProps) {
  return (
    <RolesTableProvider {...props}>
      <RolesTableContainer />
    </RolesTableProvider>
  )
}

function RolesTableContainer() {
  const { state } = useRolesTable()
  const { isPending } = state

  if (isPending) {
    return <TableSkeleton columns={5} rows={5} />
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm overflow-hidden">
        <RolesTableHeader />
        <CardContent>
          <RolesTableContent />
          <RolesTablePagination />
        </CardContent>
      </Card>
    </div>
  )
}
