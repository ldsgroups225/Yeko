import { IconPlus } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { z } from 'zod'
import { LinkTeacherDialog } from '@/components/hr/teachers/link-teacher-dialog'
import { TeachersTable } from '@/components/hr/teachers/teachers-table'

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
      <div className="flex justify-end">
        <div className="flex gap-2">
          <LinkTeacherDialog />
          <Button
            render={(
              <Link to="/users/teachers/new">
                <IconPlus className="mr-2 h-4 w-4" />
                {t.hr.teachers.addTeacher()}
              </Link>
            )}
          />
        </div>
      </div>

      <TeachersTable filters={search} />
    </div>
  )
}
