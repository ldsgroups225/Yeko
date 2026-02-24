import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'
import { useSchoolSubjectList } from './school-subject-list-context'

export function SchoolSubjectListPagination() {
  const t = useTranslations()
  const { state } = useSchoolSubjectList()
  const { table, subjectsData } = state

  const hasNoData = subjectsData.length === 0

  if (hasNoData || table.getPageCount() <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="border-border/40 bg-card/50 backdrop-blur-sm"
      >
        <IconChevronLeft className="h-4 w-4 mr-1" />
        {t.common.previous()}
      </Button>
      <span className="text-sm text-muted-foreground">
        {table.getState().pagination.pageIndex + 1}
        {' '}
        /
        {table.getPageCount()}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="border-border/40 bg-card/50 backdrop-blur-sm"
      >
        {t.common.next()}
        <IconChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}
