import type { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import type { Conflict } from './conflict-indicator'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconCalendar, IconDeviceFloppy, IconLoader2, IconTrash, IconX } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslations } from '@/i18n'

import { dayOfWeekLabels } from '@/schemas/timetable'
import { ConflictIndicator } from './conflict-indicator'

const defaultConflicts: Conflict[] = []

const sessionFormSchema = z.object({
  subjectId: z.string().min(1, 'Matière requise'),
  teacherId: z.string().min(1, 'Enseignant requis'),
  classroomId: z.string().optional(),
  dayOfWeek: z.number().min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format invalide'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format invalide'),
  notes: z.string().max(500).optional(),
  color: z.string().optional(),
}).refine(
  data => data.endTime > data.startTime,
  { message: 'L\'heure de fin doit être après l\'heure de début', path: ['endTime'] },
)

export type SessionFormInput = z.infer<typeof sessionFormSchema>

interface Subject {
  id: string
  name: string
}

interface Teacher {
  id: string
  name: string
}

interface Classroom {
  id: string
  name: string
}

interface TimetableSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialData?: Partial<SessionFormInput> & { id?: string }
  subjects: Subject[]
  teachers: Teacher[]
  classrooms: Classroom[]
  conflicts?: Conflict[]
  onSubmit: (data: SessionFormInput & { id?: string }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  isSubmitting?: boolean
  isDeleting?: boolean
}

export function TimetableSessionDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  subjects,
  teachers,
  classrooms,
  conflicts = defaultConflicts,
  onSubmit,
  onDelete,
  isSubmitting,
  isDeleting,
}: TimetableSessionDialogProps) {
  const t = useTranslations()

  const form = useForm<SessionFormInput>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      subjectId: initialData?.subjectId ?? '',
      teacherId: initialData?.teacherId ?? '',
      classroomId: initialData?.classroomId ?? '',
      dayOfWeek: initialData?.dayOfWeek ?? 1,
      startTime: initialData?.startTime ?? '08:00',
      endTime: initialData?.endTime ?? '09:00',
      notes: initialData?.notes ?? '',
      color: initialData?.color ?? '#3b82f6',
    },
  })

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
    <Dialog
      open={open}
      onOpenChange={(isOpen, eventDetails: DialogPrimitive.Root.ChangeEventDetails) => {
        if (!isOpen && eventDetails.reason === 'outside-press') {
          return
        }
        onOpenChange(isOpen)
      }}
    >
      <DialogContent
        className="max-w-md sm:max-w-lg backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight italic">
            {mode === 'create'
              ? t.timetables.addSession()
              : t.timetables.editSession()}
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-muted-foreground/60 italic">
            {mode === 'create'
              ? t.timetables.addSessionDescription()
              : t.timetables.editSessionDescription()}
          </DialogDescription>
        </DialogHeader>

        {conflicts.length > 0 && (
          <ConflictIndicator conflicts={conflicts} className="w-fit mb-4" />
        )}

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Subject */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="subjectId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.subjects.subject()}</Label>
              <Select
                value={form.watch('subjectId')}
                onValueChange={v => form.setValue('subjectId', v ?? '')}
              >
                <SelectTrigger id="subjectId" className="h-11 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
                  <SelectValue placeholder={t.common.select()}>
                    {form.watch('subjectId')
                      ? (() => {
                          const s = subjects.find(i => i.id === form.watch('subjectId'))
                          return s
                            ? (
                                <div className="flex items-center gap-2 text-primary">
                                  <div className="size-2 rounded-full bg-primary" />
                                  <span>{s.name}</span>
                                </div>
                              )
                            : undefined
                        })()
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id} className="rounded-lg focus:bg-primary/10 focus:text-primary font-medium">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.subjectId && (
                <p className="text-xs font-bold text-destructive pl-1">
                  {form.formState.errors.subjectId.message}
                </p>
              )}
            </div>

            {/* Teacher */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="teacherId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.teachers.teacher()}</Label>
              <Select
                value={form.watch('teacherId')}
                onValueChange={v => form.setValue('teacherId', v ?? '')}
              >
                <SelectTrigger id="teacherId" className="h-11 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
                  <SelectValue placeholder={t.common.select()}>
                    {form.watch('teacherId')
                      ? (() => {
                          const teacher = teachers.find(i => i.id === form.watch('teacherId'))
                          return teacher
                            ? (
                                <div className="flex items-center gap-2 text-emerald-500">
                                  <div className="size-2 rounded-full bg-emerald-500" />
                                  <span>{teacher.name}</span>
                                </div>
                              )
                            : undefined
                        })()
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id} className="rounded-lg focus:bg-primary/10 focus:text-primary font-medium">{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.teacherId && (
                <p className="text-xs font-bold text-destructive pl-1">
                  {form.formState.errors.teacherId.message}
                </p>
              )}
            </div>

            {/* Classroom */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="classroomId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.classrooms.classroom()}</Label>
              <Select
                value={form.watch('classroomId') ?? 'none'}
                onValueChange={v => form.setValue('classroomId', v === 'none' || v === null ? undefined : v)}
              >
                <SelectTrigger id="classroomId" className="h-11 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
                  <SelectValue placeholder={t.common.optional()}>
                    {form.watch('classroomId') && form.watch('classroomId') !== 'none'
                      ? (() => {
                          const c = classrooms.find(i => i.id === form.watch('classroomId'))
                          return c
                            ? (
                                <div className="flex items-center gap-2 text-amber-500">
                                  <div className="size-2 rounded-full bg-amber-500" />
                                  <span>{c.name}</span>
                                </div>
                              )
                            : undefined
                        })()
                      : form.watch('classroomId') === 'none' || !form.watch('classroomId')
                        ? (
                            <span className="italic text-muted-foreground/60 font-medium lowercase">
                              {t.common.none()}
                            </span>
                          )
                        : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                  <SelectItem value="none" className="rounded-lg focus:bg-primary/10 italic text-muted-foreground">{t.common.none()}</SelectItem>
                  {classrooms.map(c => (
                    <SelectItem key={c.id} value={c.id} className="rounded-lg focus:bg-primary/10 focus:text-primary font-medium">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Day of Week */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="dayOfWeek" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.timetables.day()}</Label>
              <Select
                value={String(form.watch('dayOfWeek'))}
                onValueChange={v => form.setValue('dayOfWeek', Number(v))}
              >
                <SelectTrigger id="dayOfWeek" className="h-11 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
                  <SelectValue>
                    {form.watch('dayOfWeek')
                      ? (() => {
                          const day = form.watch('dayOfWeek')
                          return (
                            <div className="flex items-center gap-2">
                              <IconCalendar className="size-3.5 text-primary/60" />
                              <span>{dayOfWeekLabels[day]}</span>
                            </div>
                          )
                        })()
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <SelectItem key={d} value={String(d)} className="rounded-lg focus:bg-primary/10 focus:text-primary font-medium">
                      {dayOfWeekLabels[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Time */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="startTime" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.timetables.startTime()}</Label>
              <Input
                id="startTime"
                type="time"
                className="h-11 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold tabular-nums"
                {...form.register('startTime')}
              />
              {form.formState.errors.startTime && (
                <p className="text-xs font-bold text-destructive pl-1">
                  {form.formState.errors.startTime.message}
                </p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="endTime" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.timetables.endTime()}</Label>
              <Input
                id="endTime"
                type="time"
                className="h-11 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold tabular-nums"
                {...form.register('endTime')}
              />
              {form.formState.errors.endTime && (
                <p className="text-xs font-bold text-destructive pl-1">
                  {form.formState.errors.endTime.message}
                </p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="color" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.common.color()}</Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="color"
                  type="color"
                  className="h-12 w-20 rounded-xl border-border/40 p-1 cursor-pointer bg-background/50"
                  {...form.register('color')}
                />
                <div
                  className="h-12 flex-1 rounded-xl border border-border/40 transition-colors"
                  style={{ backgroundColor: form.watch('color') }}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.common.notes()}</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder={t.common.optional()}
              className="resize-none rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-medium"
              {...form.register('notes')}
            />
          </div>

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
            {mode === 'edit' && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="rounded-xl font-bold uppercase tracking-wider text-xs"
              >
                {isDeleting
                  ? (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    )
                  : (
                      <IconTrash className="mr-2 h-4 w-4" />
                    )}
                {t.common.delete()}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="rounded-xl font-bold uppercase tracking-wider text-xs bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {isSubmitting
                ? (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )
                : (
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                  )}
              {t.common.save()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
