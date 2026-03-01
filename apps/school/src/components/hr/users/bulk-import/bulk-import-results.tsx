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
      className="
        border-border/40 bg-card/50 rounded-xl border p-8 shadow-sm
        backdrop-blur-xl
      "
    >
      <div className="mb-6 flex items-center gap-2">
        <div className="
          bg-primary/10 text-primary flex h-8 w-8 items-center justify-center
          rounded-lg
        "
        >
          <IconSettings className="h-4 w-4" />
        </div>
        <h2 className="font-serif text-xl font-semibold">{t.hr.users.importResults()}</h2>
      </div>

      <div className="
        grid max-w-2xl gap-4
        sm:grid-cols-2
      "
      >
        <div className="
          bg-success/5 border-success/10 flex items-center gap-4 rounded-xl
          border p-4 shadow-sm
        "
        >
          <div className="
            bg-success/10 text-success flex h-10 w-10 items-center
            justify-center rounded-full
          "
          >
            <IconCircleCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-success text-2xl leading-none font-bold">{results.success}</p>
            <p className="
              text-success/70 mt-1 text-xs font-bold tracking-wider uppercase
            "
            >
              {t.hr.users.usersImported()}
            </p>
          </div>
        </div>

        {results.failed > 0 && (
          <div className="
            bg-destructive/5 border-destructive/10 flex items-center gap-4
            rounded-xl border p-4 shadow-sm
          "
          >
            <div className="
              bg-destructive/10 text-destructive flex h-10 w-10 items-center
              justify-center rounded-full
            "
            >
              <IconAlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-destructive text-2xl leading-none font-bold">{results.failed}</p>
              <p className="
                text-destructive/70 mt-1 text-xs font-bold tracking-wider
                uppercase
              "
              >
                {t.hr.users.usersFailed()}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
