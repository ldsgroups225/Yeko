import { IconPlus } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { z } from 'zod'
import { RolesTable } from '@/components/hr/roles/roles-table'
import { useTranslations } from '@/i18n'

const rolesSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  search: z.string().optional(),
  scope: z.enum(['school', 'system']).optional(),
})

export const Route = createFileRoute('/_auth/settings/roles/')({
  component: RolesListPage,
  validateSearch: rolesSearchSchema,
})

function RolesListPage() {
  const t = useTranslations()
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex gap-2">
          <Button
            render={(
              <Link to="/settings/roles/new">
                <IconPlus className="mr-2 h-4 w-4" />
                {t.hr.roles.addRole()}
              </Link>
            )}
          />
        </div>
      </div>

      <RolesTable filters={search} />
    </div>
  )
}
