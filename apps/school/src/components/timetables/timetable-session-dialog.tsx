import type { Conflict } from './conflict-indicator'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { dayOfWeekLabels } from '@/schemas/timetable'
import { ConflictIndicator } from './conflict-indicator'

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

type SessionFormInput = z.infer<typeof sessionFormSchema>

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
  conflicts = [],
  onSubmit,
  onDelete,
  isSubmitting,
  isDeleting,
}: TimetableSessionDialogProps) {
  const { t } = useTranslation()

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? t('timetables.addSession')
              : t('timetables.editSession')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? t('timetables.addSessionDescription')
              : t('timetables.editSessionDescription')}
          </DialogDescription>
        </DialogHeader>

        {conflicts.length > 0 && (
          <ConflictIndicator conflicts={conflicts} className="w-fit" />
        )}

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subjectId">{t('subjects.subject')}</Label>
              <Select
                value={form.watch('subjectId')}
                onValueChange={v => form.setValue('subjectId', v)}
              >
                <SelectTrigger id="subjectId">
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.subjectId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.subjectId.message}
                </p>
              )}
            </div>

            {/* Teacher */}
            <div className="space-y-2">
              <Label htmlFor="teacherId">{t('teachers.teacher')}</Label>
              <Select
                value={form.watch('teacherId')}
                onValueChange={v => form.setValue('teacherId', v)}
              >
                <SelectTrigger id="teacherId">
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.teacherId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.teacherId.message}
                </p>
              )}
            </div>

            {/* Classroom */}
            <div className="space-y-2">
              <Label htmlFor="classroomId">{t('classrooms.classroom')}</Label>
              <Select
                value={form.watch('classroomId') ?? ''}
                onValueChange={v => form.setValue('classroomId', v || undefined)}
              >
                <SelectTrigger id="classroomId">
                  <SelectValue placeholder={t('common.optional')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('common.none')}</SelectItem>
                  {classrooms.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Day of Week */}
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">{t('timetables.day')}</Label>
              <Select
                value={String(form.watch('dayOfWeek'))}
                onValueChange={v => form.setValue('dayOfWeek', Number(v))}
              >
                <SelectTrigger id="dayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <SelectItem key={d} value={String(d)}>
                      {dayOfWeekLabels[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime">{t('timetables.startTime')}</Label>
              <Input
                id="startTime"
                type="time"
                {...form.register('startTime')}
              />
              {form.formState.errors.startTime && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.startTime.message}
                </p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime">{t('timetables.endTime')}</Label>
              <Input
                id="endTime"
                type="time"
                {...form.register('endTime')}
              />
              {form.formState.errors.endTime && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.endTime.message}
                </p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">{t('common.color')}</Label>
              <Input
                id="color"
                type="color"
                className="h-10 w-full"
                {...form.register('color')}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('common.notes')}</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder={t('common.optional')}
              {...form.register('notes')}
            />
          </div>

          <DialogFooter className="gap-2">
            {mode === 'edit' && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
              >
                {isDeleting
                  ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )
                  : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                {t('common.delete')}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || isDeleting}>
              {isSubmitting
                ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )
                : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
