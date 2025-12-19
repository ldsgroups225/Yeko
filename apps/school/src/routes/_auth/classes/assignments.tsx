import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { TeacherAssignmentList } from '@/components/academic/assignments/teacher-assignment-list'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export const Route = createFileRoute('/_auth/classes/assignments')({
  component: AssignmentsPage,
})

function AssignmentsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.academic'), href: '/academic' },
          { label: t('academic.assignments.breadcrumb') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('academic.assignments.title')}</h1>
        <p className="text-muted-foreground">{t('academic.assignments.description')}</p>
      </div>

      <TeacherAssignmentList />
    </div>
  )
}
