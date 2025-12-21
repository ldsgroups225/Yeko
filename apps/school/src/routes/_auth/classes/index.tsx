import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ClassesTable } from '@/components/academic/classes/classes-table'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'

const classesSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
})

export const Route = createFileRoute('/_auth/classes/')({
  component: ClassesPage,
  validateSearch: classesSearchSchema,
})

function ClassesPage() {
  const t = useTranslations()
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.academic(), href: '/academic' },
          { label: t.nav.classes() },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.nav.classes()}</h1>
          <p className="text-muted-foreground">{t.classes.description()}</p>
        </div>
      </div>

      <ClassesTable filters={search} />
    </div>
  )
}
