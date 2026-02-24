import { IconAlertCircle, IconCircleCheck, IconSettings } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useBulkImport } from './bulk-import-context'

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function BulkImportResults() {
  const t = useTranslations()
  const { state } = useBulkImport()
  const { results } = state

  if (!results)
    return null

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-8 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconSettings className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-serif font-semibold">{t.hr.users.importResults()}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/10 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
            <IconCircleCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success leading-none">{results.success}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-success/70 mt-1">
              {t.hr.users.usersImported()}
            </p>
          </div>
        </div>

        {results.failed > 0 && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <IconAlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive leading-none">{results.failed}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-destructive/70 mt-1">
                {t.hr.users.usersFailed()}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
