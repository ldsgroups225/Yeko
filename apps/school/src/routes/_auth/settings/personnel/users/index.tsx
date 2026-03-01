import { IconPlus } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { buttonVariants } from '@workspace/ui/components/button'
import { z } from 'zod'
import { FinanceSubpageToolbar } from '@/components/finance/finance-subpage-toolbar'
import { UsersTable } from '@/components/hr/users/users-table'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

const usersSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  search: z.string().optional(),
  roleId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
})

export const Route = createFileRoute('/_auth/settings/personnel/users/')({
  component: UsersListPage,
  validateSearch: usersSearchSchema,
})

function UsersListPage() {
  const t = useTranslations()
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <FinanceSubpageToolbar
        backTo="/settings/personnel"
        actions={(
          <Link
            to="/settings/personnel/users/new"
            className={cn(buttonVariants({ size: 'sm' }), 'rounded-xl')}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            {t.hr.users.addUser()}
          </Link>
        )}
      />

      <UsersTable filters={search} />
    </div>
  )
}
