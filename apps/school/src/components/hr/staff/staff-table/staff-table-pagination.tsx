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
    <div className="
      mt-6 flex flex-col items-center justify-between gap-4
      sm:flex-row
    "
    >
      <div className="text-muted-foreground text-sm font-medium">
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
          className="
            border-border/40 bg-background/50
            hover:bg-background
            rounded-xl px-4 transition-all
          "
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
          className="
            border-border/40 bg-background/50
            hover:bg-background
            rounded-xl px-4 transition-all
          "
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
