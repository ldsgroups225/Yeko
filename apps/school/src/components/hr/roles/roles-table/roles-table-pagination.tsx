import { Button } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'
import { useRolesTable } from './roles-table-context'

export function RolesTablePagination() {
  const t = useTranslations()
  const { state, actions } = useRolesTable()
  const { rolesData } = state
  const { handlePageChange } = actions

  if (!rolesData || rolesData.totalPages <= 1)
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
          {(rolesData.page - 1) * rolesData.limit + 1}
        </span>
        {' '}
        -
        {' '}
        <span className="text-foreground">
          {Math.min(rolesData.page * rolesData.limit, rolesData.total)}
        </span>
        {' '}
        {t.common.of()}
        {' '}
        <span className="text-foreground">{rolesData.total}</span>
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
            handlePageChange(rolesData.page - 1)
          }}
          disabled={rolesData.page === 1}
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
            handlePageChange(rolesData.page + 1)
          }}
          disabled={rolesData.page === rolesData.totalPages}
        >
          {t.common.next()}
        </Button>
      </div>
    </div>
  )
}
