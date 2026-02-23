import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@workspace/ui/components/page-header'
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

      <PageHeader
        title={t.nav.classes()}
        description={t.classes.description()}
      />

      <ClassesTable filters={search} />
    </div>
  )
}
