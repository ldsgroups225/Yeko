import { IconAlertTriangle, IconCloud, IconCloudOff, IconDeviceFloppy, IconLoader2, IconPlus, IconSend } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useGradeEntry } from './grade-entry-context'

export function GradeEntryFooter() {
  const t = useTranslations()
  const { state, actions } = useGradeEntry()
  const { pendingChanges, autoSaveStatus, isPendingAction, isMissingTeacher, isComplete, gradesByStudent } = state
  const { handleNewEvaluation, handleSavePending, handleSubmitForValidation } = actions

  return (
    <motion.div
      layout
      className="
        border-primary/20 bg-primary/5 flex items-center justify-between
        rounded-2xl border p-4 shadow-inner backdrop-blur-md
      "
    >
      <div className="flex items-center gap-6">
        <AnimatePresence mode="wait">
          {pendingChanges.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="
                bg-accent/10 border-accent/20 text-accent-foreground flex
                items-center gap-2 rounded-xl border px-3 py-1.5
              "
            >
              <IconAlertTriangle className="size-4" />
              <span className="text-xs font-bold tracking-tight uppercase">
                {t.academic.grades.validations.pendingCount({ count: pendingChanges.size })}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {autoSaveStatus === 'saving' && (
              <motion.span
                key="saving"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="
                  text-muted-foreground flex items-center gap-2 text-xs
                  font-semibold
                "
              >
                <IconLoader2 className="size-3.5 animate-spin" />
                {t.academic.grades.autoSave.saving()}
              </motion.span>
            )}
            {autoSaveStatus === 'saved' && (
              <motion.span
                key="saved"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="
                  text-success flex items-center gap-2 text-xs font-bold
                "
              >
                <div className="
                  bg-success/10 border-success/20 rounded-full border p-1
                "
                >
                  <IconCloud className="size-3" />
                </div>
                {t.academic.grades.autoSave.saved()}
              </motion.span>
            )}
            {autoSaveStatus === 'error' && (
              <motion.span
                key="error"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="
                  text-destructive flex items-center gap-2 text-xs font-bold
                "
              >
                <div className="
                  bg-destructive/10 border-destructive/20 rounded-full border
                  p-1
                "
                >
                  <IconCloudOff className="size-3" />
                </div>
                {t.academic.grades.autoSave.error()}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleNewEvaluation}
          variant="outline"
          className="
            border-primary/20
            hover:bg-primary/5
            text-primary rounded-xl font-bold
          "
        >
          <IconPlus className="mr-2 size-4" />
          {t.academic.grades.entry.newEvaluation()}
        </Button>

        <AnimatePresence>
          {pendingChanges.size > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Button
                onClick={handleSavePending}
                disabled={isPendingAction || isMissingTeacher}
                variant="outline"
                className="
                  border-accent/30 bg-accent/5
                  hover:bg-accent/10
                  text-accent-foreground rounded-xl font-bold
                "
              >
                {isPendingAction
                  ? (
                      <IconLoader2 className="
                        text-accent-foreground mr-2 size-4 animate-spin
                      "
                      />
                    )
                  : (
                      <IconDeviceFloppy className="
                        text-accent-foreground mr-2 size-4
                      "
                      />
                    )}
                {t.common.save()}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={handleSubmitForValidation}
          disabled={!isComplete || isPendingAction}
          className="shadow-primary/20 rounded-xl px-6 font-bold shadow-lg"
        >
          {isPendingAction
            ? <IconLoader2 className="mr-2 size-4 animate-spin" />
            : <IconSend className="mr-2 size-4" />}
          {t.common.submit()}
          {gradesByStudent.size > 0 && (
            <Badge
              variant="secondary"
              className="
                bg-primary-foreground/10 text-primary-foreground ml-2
                rounded-full border-none px-2 font-bold
              "
            >
              {gradesByStudent.size}
            </Badge>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
