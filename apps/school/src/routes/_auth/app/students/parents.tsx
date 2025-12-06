import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ParentsList } from '@/components/students'

export const Route = createFileRoute('/_auth/app/students/parents')({
  component: ParentsPage,
})

function ParentsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('students.title'), href: '/app/students' },
          { label: t('parents.title') },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">{t('parents.title')}</h1>
        <p className="text-muted-foreground">{t('parents.description')}</p>
      </div>

      <ParentsList />
    </div>
  )
}
