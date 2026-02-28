import type { StaffFilters } from './staff-table/types'
import { Card, CardContent } from '@workspace/ui/components/card'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { StaffTableContent } from './staff-table/staff-table-content'
import { useStaffTable } from './staff-table/staff-table-context'
import { StaffTableHeader } from './staff-table/staff-table-header'
import { StaffTablePagination } from './staff-table/staff-table-pagination'
import { StaffTableProvider } from './staff-table/staff-table-provider'

interface StaffTableProps {
  filters: StaffFilters
}

export function StaffTable(props: StaffTableProps) {
  return (
    <StaffTableProvider {...props}>
      <StaffTableContainer />
    </StaffTableProvider>
  )
}

function StaffTableContainer() {
  const { state } = useStaffTable()
  const { isPending } = state

  if (isPending) {
    return <TableSkeleton columns={6} rows={5} />
  }

  return (
    <div className="space-y-6">
      <Card className="
        border-border/40 bg-card/50 overflow-hidden shadow-sm backdrop-blur-xl
      "
      >
        <StaffTableHeader />
        <CardContent>
          <StaffTableContent />
          <StaffTablePagination />
        </CardContent>
      </Card>
    </div>
  )
}
