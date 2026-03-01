import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@workspace/ui/components/page-header'

import { motion } from 'motion/react'
import { SchoolSubjectList } from '@/components/academic/subjects/school-subject-list'
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
              <div className="
                text-muted-foreground border-border/30 bg-card/10 flex flex-col
                items-center justify-center rounded-3xl border-2 border-dashed
                py-20
              "
              >
                <p className="text-lg font-medium">{t.academic.subjects.messages.selectSchoolYearPrompt()}</p>
              </div>
            )}
      </motion.div>
    </div>
  )
}
