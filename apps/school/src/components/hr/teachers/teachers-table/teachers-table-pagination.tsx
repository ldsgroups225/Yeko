import { Button } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'
import { useTeachersTable } from './teachers-table-context'

export function TeachersTablePagination() {
  const t = useTranslations()
  const { state, actions } = useTeachersTable()
  const { teachersData } = state
  const { handlePageChange } = actions

  if (!teachersData || teachersData.totalPages <= 1)
    return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
      <div className="text-sm text-muted-foreground font-medium">
        {t.common.showing()}
        {' '}
        <span className="text-foreground">
          {(teachersData.page - 1) * teachersData.limit + 1}
        </span>
        {' '}
        -
        {' '}
        <span className="text-foreground">
          {Math.min(teachersData.page * teachersData.limit, teachersData.total)}
        </span>
        {' '}
        {t.common.of()}
        {' '}
        <span className="text-foreground">{teachersData.total}</span>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-border/40 bg-background/50 hover:bg-background transition-all px-4"
          onClick={(e) => {
            e.stopPropagation()
            handlePageChange(teachersData.page - 1)
          }}
          disabled={teachersData.page === 1}
        >
          {t.common.previous()}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-border/40 bg-background/50 hover:bg-background transition-all px-4"
          onClick={(e) => {
            e.stopPropagation()
            handlePageChange(teachersData.page + 1)
          }}
          disabled={teachersData.page === teachersData.totalPages}
        >
          {t.common.next()}
        </Button>
      </div>
    </div>
  )
}
