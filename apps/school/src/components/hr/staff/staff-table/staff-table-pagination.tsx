import { Button } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'
import { useStaffTable } from './staff-table-context'

export function StaffTablePagination() {
  const t = useTranslations()
  const { state, actions } = useStaffTable()
  const { staffData } = state
  const { handlePageChange } = actions

  if (!staffData || staffData.totalPages <= 1)
    return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
      <div className="text-sm text-muted-foreground font-medium">
        {t.common.showing()}
        {' '}
        <span className="text-foreground">
          {(staffData.page - 1) * staffData.limit + 1}
        </span>
        {' '}
        -
        {' '}
        <span className="text-foreground">
          {Math.min(staffData.page * staffData.limit, staffData.total)}
        </span>
        {' '}
        {t.common.of()}
        {' '}
        <span className="text-foreground">{staffData.total}</span>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-border/40 bg-background/50 hover:bg-background transition-all px-4"
          onClick={(e) => {
            e.stopPropagation()
            handlePageChange(staffData.page - 1)
          }}
          disabled={staffData.page === 1}
        >
          {t.common.previous()}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-border/40 bg-background/50 hover:bg-background transition-all px-4"
          onClick={(e) => {
            e.stopPropagation()
            handlePageChange(staffData.page + 1)
          }}
          disabled={staffData.page === staffData.totalPages}
        >
          {t.common.next()}
        </Button>
      </div>
    </div>
  )
}
