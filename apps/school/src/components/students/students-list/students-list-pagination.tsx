import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'
import { useStudentsList } from './students-list-context'

export function StudentsListPagination() {
  const t = useTranslations()
  const { state, actions } = useStudentsList()
  const { data, page } = state
  const { setPage } = actions

  if (!data || data.totalPages <= 1)
    return null

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
      >
        <IconChevronLeft className="h-4 w-4" />
        {t.common.previous()}
      </Button>
      <span className="text-muted-foreground text-sm">
        {t.common.pageOf({ page, totalPages: data.totalPages })}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
        disabled={page === data.totalPages}
      >
        {t.common.next()}
        <IconChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
