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
    <div className="border-border/10 border-t bg-white/5 p-6">
      <DialogFooter className="
        flex flex-col items-center justify-between gap-4
        sm:flex-row
      "
      >
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="
              bg-primary/10 text-primary border-primary/20 h-6 px-2 font-mono
            "
          >
            {selectedIds.size}
          </Badge>
          <span className="
            text-muted-foreground text-xs font-semibold tracking-tight uppercase
          "
          >
            {t.academic.subjects.picker.selected()}
          </span>
        </div>
        <div className="
          flex w-full gap-2
          sm:w-auto
        "
        >
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="
              flex-1
              hover:bg-white/10
              sm:flex-none
            "
          >
            {t.common.cancel()}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedIds.size === 0 || isAdding}
            className="
              bg-primary
              hover:bg-primary/90
              shadow-primary/20 flex-1 shadow-lg
              sm:min-w-[160px]
            "
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
