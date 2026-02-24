import { IconCheck, IconLoader2 } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { DialogFooter } from '@workspace/ui/components/dialog'
import { useTranslations } from '@/i18n'
import { useSubjectPicker } from './subject-picker-context'

export function SubjectPickerFooter() {
  const t = useTranslations()
  const { state, actions } = useSubjectPicker()
  const { selectedIds, isAdding } = state
  const { handleSubmit, setOpen } = actions

  return (
    <div className="p-6 bg-white/5 border-t border-border/10">
      <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono bg-primary/10 text-primary border-primary/20 h-6 px-2">
            {selectedIds.size}
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">
            {t.academic.subjects.picker.selected()}
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="flex-1 sm:flex-none hover:bg-white/10"
          >
            {t.common.cancel()}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedIds.size === 0 || isAdding}
            className="flex-1 sm:min-w-[160px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {isAdding
              ? (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )
              : (
                  <IconCheck className="mr-2 h-4 w-4" />
                )}
            {t.academic.subjects.picker.addSelected()}
          </Button>
        </div>
      </DialogFooter>
    </div>
  )
}
