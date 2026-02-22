import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@workspace/ui/components/page-header'

import { motion } from 'motion/react'
import { SchoolSubjectList } from '@/components/academic/subjects/school-subject-list'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/programs/subjects')({
  component: SchoolSubjectsPage,
})

function SchoolSubjectsPage() {
  const t = useTranslations()
  const { schoolYearId } = useSchoolYearContext()

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.academic(), href: '/academic' },
          { label: t.nav.subjects() },
        ]}
      />

      <PageHeader
        title={t.academic.subjects.title()}
        description={t.academic.subjects.description()}
      />

      {/* Subject List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {schoolYearId
          ? (
              <SchoolSubjectList schoolYearId={schoolYearId} />
            )
          : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border/30 rounded-3xl bg-card/10">
                <p className="text-lg font-medium">{t.academic.subjects.messages.selectSchoolYearPrompt()}</p>
              </div>
            )}
      </motion.div>
    </div>
  )
}
