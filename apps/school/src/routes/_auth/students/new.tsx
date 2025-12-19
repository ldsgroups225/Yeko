import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { StudentForm } from '@/components/students'

export const Route = createFileRoute('/_auth/students/new')({
  component: NewStudentPage,
})

function NewStudentPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('students.title'), href: '/students' },
          { label: t('students.addStudent') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('students.addStudent')}</h1>
        <p className="text-muted-foreground">{t('students.addStudentDescription')}</p>
      </div>

      <StudentForm mode="create" />
    </div>
  )
}
