import type { SessionFormInput, TimetableSessionDialogProps } from './types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { TimetableSessionContext } from './timetable-session-context'
import { sessionFormSchema } from './types'

/** Default session duration in minutes for newly-created slots. */
const DEFAULT_SESSION_DURATION_MINUTES = 60

/**
 * Adds `durationMinutes` to a "HH:MM" time string and returns a new "HH:MM" string.
 * Clamps at "23:59" if the result overflows midnight.
 */
function addMinutesToTime(time: string, durationMinutes: number): string {
  const [h = 0, m = 0] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + durationMinutes
  const clampedMinutes = Math.min(totalMinutes, 23 * 60 + 59)
  const newH = Math.floor(clampedMinutes / 60)
  const newM = clampedMinutes % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

export function TimetableSessionProvider({
  children,
  ...props
}: TimetableSessionDialogProps & { children: React.ReactNode }) {
  const { initialData, onSubmit, onDelete, onOpenChange } = props

  const form = useForm<SessionFormInput>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      subjectId: initialData?.subjectId ?? '',
      teacherId: initialData?.teacherId ?? '',
      classroomId: initialData?.classroomId ?? '',
      dayOfWeek: initialData?.dayOfWeek ?? 1,
      startTime: initialData?.startTime ?? '08:00',
      endTime: initialData?.endTime ?? addMinutesToTime(initialData?.startTime ?? '08:00', DEFAULT_SESSION_DURATION_MINUTES),
      notes: initialData?.notes ?? '',
      color: initialData?.color ?? '#3b82f6',
    },
  })

  /**
   * Sync form values whenever the dialog reopens with new initialData.
   * RHF's `defaultValues` are only read on initial mount, so we must
   * call `form.reset()` explicitly to prefill a freshly-clicked slot.
   */
  useEffect(() => {
    const startTime = initialData?.startTime ?? '08:00'
    form.reset({
      subjectId: initialData?.subjectId ?? '',
      teacherId: initialData?.teacherId ?? '',
      classroomId: initialData?.classroomId ?? '',
      dayOfWeek: initialData?.dayOfWeek ?? 1,
      startTime,
      endTime: initialData?.endTime ?? addMinutesToTime(startTime, DEFAULT_SESSION_DURATION_MINUTES),
      notes: initialData?.notes ?? '',
      color: initialData?.color ?? '#3b82f6',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  const handleSubmit = async (data: SessionFormInput) => {
    await onSubmit({ ...data, id: initialData?.id })
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (initialData?.id && onDelete) {
      await onDelete(initialData.id)
      onOpenChange(false)
    }
  }

  return (
    <TimetableSessionContext
      value={{
        state: {
          mode: props.mode,
          initialData: props.initialData,
          subjects: props.subjects,
          teachers: props.teachers,
          classrooms: props.classrooms,
          conflicts: props.conflicts || [],
          isSubmitting: props.isSubmitting,
          isDeleting: props.isDeleting,
        },
        actions: {
          form,
          handleSubmit,
          handleDelete,
          onOpenChange,
        },
      }}
    >
      {children}
    </TimetableSessionContext>
  )
}
