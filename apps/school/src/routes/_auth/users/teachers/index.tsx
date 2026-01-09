import { IconPlus } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { z } from 'zod'
import { TeachersTable } from '@/components/hr/teachers/teachers-table'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'

const teachersSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  search: z.string().optional(),
  subjectId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
})

export const Route = createFileRoute('/_auth/users/teachers/')({
  component: TeachersListPage,
  validateSearch: teachersSearchSchema,
})

function TeachersListPage() {
  const t = useTranslations()
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.hr.title(), href: '/users' },
          { label: t.hr.teachers.title() },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.hr.teachers.title()}</h1>
          <p className="text-muted-foreground">{t.hr.teachers.description()}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/users/teachers/new">
              <IconPlus className="mr-2 h-4 w-4" />
              {t.hr.teachers.addTeacher()}
            </Link>
          </Button>
        </div>
      </div>

      <TeachersTable filters={search} />
    </div>
  )
}
