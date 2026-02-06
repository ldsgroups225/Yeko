import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

import { StudentsList } from '@/components/students/students-list'
import { useTranslations } from '@/i18n'

const studentsSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  search: z.string().optional(),
  status: z.enum(['active', 'graduated', 'transferred', 'withdrawn']).optional(),
  gender: z.enum(['M', 'F', 'other']).optional(),
  classId: z.string().optional(),
  gradeId: z.string().optional(),
  schoolYearId: z.string().optional(),
})

export const Route = createFileRoute('/_auth/students/')({
  component: StudentsListPage,
  validateSearch: studentsSearchSchema,
})

function StudentsListPage() {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.students.title() },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.students.title()}</h1>
          <p className="text-muted-foreground">{t.students.description()}</p>
        </div>
      </div>

      <StudentsList />
    </div>
  )
}
