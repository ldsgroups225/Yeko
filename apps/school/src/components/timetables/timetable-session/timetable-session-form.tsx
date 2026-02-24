import { IconCalendar } from '@tabler/icons-react'
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
import { useTranslations } from '@/i18n'
import { dayOfWeekLabels } from '@/schemas/timetable'
import { useTimetableSession } from './timetable-session-context'

export function TimetableSessionForm() {
  const t = useTranslations()
  const { state, actions } = useTimetableSession()
  const { subjects, teachers, classrooms } = state
  const { form } = actions

  return (
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
          <p className="text-xs font-bold text-destructive pl-1">{form.formState.errors.subjectId.message}</p>
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
          <p className="text-xs font-bold text-destructive pl-1">{form.formState.errors.teacherId.message}</p>
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
                          <div className="flex items-center gap-2 text-accent">
                            <div className="size-2 rounded-full bg-accent" />
                            <span>{c.name}</span>
                          </div>
                        )
                      : undefined
                  })()
                : form.watch('classroomId') === 'none' || !form.watch('classroomId')
                  ? <span className="italic text-muted-foreground/60 font-medium lowercase">{t.common.none()}</span>
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
              {form.watch('dayOfWeek') && (
                <div className="flex items-center gap-2">
                  <IconCalendar className="size-3.5 text-primary/60" />
                  <span>{dayOfWeekLabels[form.watch('dayOfWeek')]}</span>
                </div>
              )}
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

      {/* Times */}
      <div className="space-y-2 col-span-2 sm:col-span-1">
        <Label htmlFor="startTime" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.timetables.startTime()}</Label>
        <Input id="startTime" type="time" lang="fr" className="h-11 rounded-xl bg-background/50 border-border/40 transition-all font-bold tabular-nums" {...form.register('startTime')} />
        {form.formState.errors.startTime && <p className="text-xs font-bold text-destructive pl-1">{form.formState.errors.startTime.message}</p>}
      </div>
      <div className="space-y-2 col-span-2 sm:col-span-1">
        <Label htmlFor="endTime" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.timetables.endTime()}</Label>
        <Input id="endTime" type="time" lang="fr" className="h-11 rounded-xl bg-background/50 border-border/40 transition-all font-bold tabular-nums" {...form.register('endTime')} />
        {form.formState.errors.endTime && <p className="text-xs font-bold text-destructive pl-1">{form.formState.errors.endTime.message}</p>}
      </div>

      {/* Color */}
      <div className="space-y-2 col-span-2">
        <Label htmlFor="color" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.common.color()}</Label>
        <div className="flex gap-4 items-center">
          <Input id="color" type="color" className="h-12 w-20 rounded-xl border-border/40 p-1 cursor-pointer bg-background/50" {...form.register('color')} />
          <div className="h-12 flex-1 rounded-xl border border-border/40" style={{ backgroundColor: form.watch('color') }} />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2 col-span-2">
        <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">{t.common.notes()}</Label>
        <Textarea id="notes" rows={3} placeholder={t.common.optional()} className="resize-none rounded-xl bg-background/50 border-border/40 transition-all font-medium" {...form.register('notes')} />
      </div>
    </div>
  )
}
