import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { z } from 'zod'
import { StaffTable } from '@/components/hr/staff/staff-table'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/i18n'

const staffSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  search: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
})

export const Route = createFileRoute('/_auth/users/staff/')({
  component: StaffListPage,
  validateSearch: staffSearchSchema,
})

function StaffListPage() {
  const t = useTranslations()
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.hr.title(), href: '/users' },
          { label: t.hr.staff.title() },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.hr.staff.title()}</h1>
          <p className="text-muted-foreground">{t.hr.staff.description()}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/users/staff/new">
              <Plus className="mr-2 h-4 w-4" />
              {t.hr.staff.addStaff()}
            </Link>
          </Button>
        </div>
      </div>

      <StaffTable filters={search} />
    </div>
  )
}
