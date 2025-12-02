import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { RolesTable } from '@/components/hr/roles/roles-table'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'

const rolesSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  search: z.string().optional(),
  scope: z.enum(['school', 'system']).optional(),
})

export const Route = createFileRoute('/_auth/app/hr/roles/')({
  component: RolesListPage,
  validateSearch: rolesSearchSchema,
})

function RolesListPage() {
  const { t } = useTranslation()
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/app/hr' },
          { label: t('hr.roles.title') },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('hr.roles.title')}</h1>
          <p className="text-muted-foreground">{t('hr.roles.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/app/hr/roles/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('hr.roles.addRole')}
            </Link>
          </Button>
        </div>
      </div>

      <RolesTable filters={search} />
    </div>
  )
}
