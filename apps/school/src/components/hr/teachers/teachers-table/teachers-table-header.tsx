import { IconSearch } from '@tabler/icons-react'
import { CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { useTranslations } from '@/i18n'
import { useTeachersTable } from './teachers-table-context'

export function TeachersTableHeader() {
  const t = useTranslations()
  const { state, actions } = useTeachersTable()
  const { searchInput } = state
  const { setSearchInput } = actions

  return (
    <CardHeader className="pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-2xl font-serif">
          {t.hr.teachers.listTitle()}
        </CardTitle>
        <div className="relative w-full sm:w-72">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.hr.teachers.searchPlaceholder()}
            value={searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
            className="pl-10 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all"
          />
        </div>
      </div>
    </CardHeader>
  )
}
