import { createFileRoute } from '@tanstack/react-router'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

import { ParentsList } from '@/components/students'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/students/parents')({
  component: ParentsPage,
})

function ParentsPage() {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.students.title(), href: '/students' },
          { label: t.parents.title() },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">{t.parents.title()}</h1>
        <p className="text-muted-foreground">{t.parents.description()}</p>
      </div>

      <ParentsList />
    </div>
  )
}
