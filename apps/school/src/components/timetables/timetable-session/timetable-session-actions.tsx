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
    <DialogFooter className="
      gap-3 pt-4
      sm:gap-2
    "
    >
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting || isDeleting}
        className="
          border-border/40
          hover:bg-muted/50
          rounded-xl text-xs font-bold tracking-wider uppercase
        "
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
          className="rounded-xl text-xs font-bold tracking-wider uppercase"
        >
          {isDeleting
            ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            : (
                <IconTrash className="mr-2 h-4 w-4" />
              )}
          {t.common.delete()}
        </Button>
      )}
      <Button
        type="submit"
        disabled={isSubmitting || isDeleting}
        className="
          bg-primary
          hover:bg-primary/90
          shadow-primary/20 rounded-xl text-xs font-bold tracking-wider
          uppercase shadow-lg
        "
      >
        {isSubmitting
          ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          : (
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
            )}
        {t.common.save()}
      </Button>
    </DialogFooter>
  )
}
