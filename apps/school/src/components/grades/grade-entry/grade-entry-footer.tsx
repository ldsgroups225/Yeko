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
      className="flex items-center justify-between p-4 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-md shadow-inner"
    >
      <div className="flex items-center gap-6">
        <AnimatePresence mode="wait">
          {pendingChanges.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-accent-foreground"
            >
              <IconAlertTriangle className="size-4" />
              <span className="text-xs font-bold uppercase tracking-tight">
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
                className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
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
                className="flex items-center gap-2 text-xs font-bold text-success"
              >
                <div className="p-1 rounded-full bg-success/10 border border-success/20">
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
                className="flex items-center gap-2 text-xs font-bold text-destructive"
              >
                <div className="p-1 rounded-full bg-destructive/10 border border-destructive/20">
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
          className="rounded-xl font-bold border-primary/20 hover:bg-primary/5 text-primary"
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
                className="rounded-xl border-accent/30 font-bold bg-accent/5 hover:bg-accent/10 text-accent-foreground"
              >
                {isPendingAction
                  ? <IconLoader2 className="mr-2 size-4 animate-spin text-accent-foreground" />
                  : <IconDeviceFloppy className="mr-2 size-4 text-accent-foreground" />}
                {t.common.save()}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={handleSubmitForValidation}
          disabled={!isComplete || isPendingAction}
          className="rounded-xl font-bold shadow-lg shadow-primary/20 px-6"
        >
          {isPendingAction
            ? <IconLoader2 className="mr-2 size-4 animate-spin" />
            : <IconSend className="mr-2 size-4" />}
          {t.common.submit()}
          {gradesByStudent.size > 0 && (
            <Badge variant="secondary" className="ml-2 bg-primary-foreground/10 text-primary-foreground border-none px-2 rounded-full font-bold">
              {gradesByStudent.size}
            </Badge>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
