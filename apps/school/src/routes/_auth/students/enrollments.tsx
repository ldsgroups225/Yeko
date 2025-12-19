import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { EnrollmentsList } from '@/components/students'

export const Route = createFileRoute('/_auth/students/enrollments')({
  component: EnrollmentsPage,
})

function EnrollmentsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('students.title'), href: '/students' },
          { label: t('enrollments.title') },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">{t('enrollments.title')}</h1>
        <p className="text-muted-foreground">{t('enrollments.description')}</p>
      </div>

      <EnrollmentsList />
    </div>
  )
}
