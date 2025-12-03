import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { UsersTable } from '@/components/hr/users/users-table'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'

const usersSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  search: z.string().optional(),
  roleId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
})

export const Route = createFileRoute('/_auth/app/hr/users/')({
  component: UsersListPage,
  validateSearch: usersSearchSchema,
})

function UsersListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/app/hr' },
          { label: t('hr.users.title') },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('hr.users.title')}</h1>
          <p className="text-muted-foreground">{t('hr.users.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate({ to: '/app/hr/users/new' })}>
            <Plus className="mr-2 h-4 w-4" />
            {t('hr.users.addUser')}
          </Button>
        </div>
      </div>

      <UsersTable filters={search} />
    </div>
  )
}
