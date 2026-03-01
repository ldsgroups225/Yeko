import type { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import type { TimetableSessionDialogProps } from './timetable-session/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useTranslations } from '@/i18n'
import { ConflictIndicator } from './conflict-indicator'
import { TimetableSessionActions } from './timetable-session/timetable-session-actions'
import { useTimetableSession } from './timetable-session/timetable-session-context'
import { TimetableSessionForm } from './timetable-session/timetable-session-form'
import { TimetableSessionProvider } from './timetable-session/timetable-session-provider'

export type { SessionFormInput } from './timetable-session/types'

function TimetableSessionDialogInner() {
  const t = useTranslations()
  const { state, actions } = useTimetableSession()
  const { mode, conflicts } = state
  const { form, handleSubmit } = actions

  return (
    <DialogContent className="
      bg-card/95 border-border/40 max-w-md rounded-3xl p-6 shadow-2xl
      backdrop-blur-xl
      sm:max-w-lg
    "
    >
      <DialogHeader>
        <DialogTitle className="
          text-xl font-black tracking-tight uppercase italic
        "
        >
          {mode === 'create' ? t.timetables.addSession() : t.timetables.editSession()}
        </DialogTitle>
        <DialogDescription className="
          text-muted-foreground/60 text-base font-medium italic
        "
        >
          {mode === 'create' ? t.timetables.addSessionDescription() : t.timetables.editSessionDescription()}
        </DialogDescription>
      </DialogHeader>

      {conflicts && conflicts.length > 0 && (
        <ConflictIndicator conflicts={conflicts} className="mb-4 w-fit" />
      )}

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <TimetableSessionForm />
        <TimetableSessionActions />
      </form>
    </DialogContent>
  )
}

export function TimetableSessionDialog(props: TimetableSessionDialogProps) {
  return (
    <Dialog
      open={props.open}
      onOpenChange={(isOpen, eventDetails: DialogPrimitive.Root.ChangeEventDetails) => {
        if (!isOpen && eventDetails.reason === 'outside-press')
          return
        props.onOpenChange(isOpen)
      }}
    >
      <TimetableSessionProvider {...props}>
        <TimetableSessionDialogInner />
      </TimetableSessionProvider>
    </Dialog>
  )
}
