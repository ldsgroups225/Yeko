import { IconPlus } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { z } from 'zod'
import { UsersTable } from '@/components/hr/users/users-table'
import { useTranslations } from '@/i18n'

const usersSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  search: z.string().optional(),
  roleId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
})

export const Route = createFileRoute('/_auth/users/users/')({
  component: UsersListPage,
  validateSearch: usersSearchSchema,
})

function UsersListPage() {
  const t = useTranslations()
  const navigate = useNavigate()
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex gap-2">
          <Button onClick={() => navigate({ to: '/users/users/new' })}>
            <IconPlus className="mr-2 h-4 w-4" />
            {t.hr.users.addUser()}
          </Button>
        </div>
      </div>

      <UsersTable filters={search} />
    </div>
  )
}
