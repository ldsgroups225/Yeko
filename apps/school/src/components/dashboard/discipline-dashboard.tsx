import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { AbsencesSection } from './discipline-dashboard/components/absences-section'
import { ConductLateSection } from './discipline-dashboard/components/conduct-late-section'
import { MetricsSection } from './discipline-dashboard/components/metrics-section'
import { container } from './discipline-dashboard/constants'

export function DisciplineDashboard() {
  const t = useTranslations()

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t.dashboard.discipline.title()}
        </h1>
        <p className="text-muted-foreground">
          Suivi de la présence, ponctualité et conduite des élèves
        </p>
      </div>

      <MetricsSection t={t} />

      <AbsencesSection />

      <ConductLateSection />
    </motion.div>
  )
}
