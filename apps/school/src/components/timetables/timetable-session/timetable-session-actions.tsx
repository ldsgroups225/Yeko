import { IconDeviceFloppy, IconLoader2, IconTrash, IconX } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { DialogFooter } from '@workspace/ui/components/dialog'
import { useTranslations } from '@/i18n'
import { useTimetableSession } from './timetable-session-context'

export function TimetableSessionActions() {
  const t = useTranslations()
  const { state, actions } = useTimetableSession()
  const { mode, isSubmitting, isDeleting } = state
  const { handleDelete, onOpenChange } = actions

  return (
    <DialogFooter className="gap-3 sm:gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting || isDeleting}
        className="rounded-xl font-bold uppercase tracking-wider text-xs border-border/40 hover:bg-muted/50"
      >
        <IconX className="mr-2 h-4 w-4" />
        {t.common.cancel()}
      </Button>
      {mode === 'edit' && (
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting || isSubmitting}
          className="rounded-xl font-bold uppercase tracking-wider text-xs"
        >
          {isDeleting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : <IconTrash className="mr-2 h-4 w-4" />}
          {t.common.delete()}
        </Button>
      )}
      <Button
        type="submit"
        disabled={isSubmitting || isDeleting}
        className="rounded-xl font-bold uppercase tracking-wider text-xs bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
      >
        {isSubmitting ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : <IconDeviceFloppy className="mr-2 h-4 w-4" />}
        {t.common.save()}
      </Button>
    </DialogFooter>
  )
}
