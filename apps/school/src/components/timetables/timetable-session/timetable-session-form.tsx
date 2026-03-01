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
    <div className="
      grid gap-6
      sm:grid-cols-2
    "
    >
      {/* Subject */}
      <div className="
        col-span-2 space-y-2
        sm:col-span-1
      "
      >
        <Label
          htmlFor="subjectId"
          className="
            text-muted-foreground/80 pl-1 text-[10px] font-black tracking-widest
            uppercase
          "
        >
          {t.subjects.subject()}
        </Label>
        <Select
          value={form.watch('subjectId')}
          onValueChange={v => form.setValue('subjectId', v ?? '')}
        >
          <SelectTrigger
            id="subjectId"
            className="
              bg-background/50 border-border/40
              focus:ring-primary/20
              h-11 rounded-xl font-bold transition-all
            "
          >
            <SelectValue placeholder={t.common.select()}>
              {form.watch('subjectId')
                ? (() => {
                    const s = subjects.find(i => i.id === form.watch('subjectId'))
                    return s
                      ? (
                          <div className="text-primary flex items-center gap-2">
                            <div className="bg-primary size-2 rounded-full" />
                            <span>{s.name}</span>
                          </div>
                        )
                      : undefined
                  })()
                : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="
            bg-popover/90 border-border/40 rounded-xl backdrop-blur-xl
          "
          >
            {subjects.map(s => (
              <SelectItem
                key={s.id}
                value={s.id}
                className="
                  focus:bg-primary/10 focus:text-primary
                  rounded-lg font-medium
                "
              >
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.subjectId && (
          <p className="text-destructive pl-1 text-xs font-bold">{form.formState.errors.subjectId.message}</p>
        )}
      </div>

      {/* Teacher */}
      <div className="
        col-span-2 space-y-2
        sm:col-span-1
      "
      >
        <Label
          htmlFor="teacherId"
          className="
            text-muted-foreground/80 pl-1 text-[10px] font-black tracking-widest
            uppercase
          "
        >
          {t.teachers.teacher()}
        </Label>
        <Select
          value={form.watch('teacherId')}
          onValueChange={v => form.setValue('teacherId', v ?? '')}
        >
          <SelectTrigger
            id="teacherId"
            className="
              bg-background/50 border-border/40
              focus:ring-primary/20
              h-11 rounded-xl font-bold transition-all
            "
          >
            <SelectValue placeholder={t.common.select()}>
              {form.watch('teacherId')
                ? (() => {
                    const teacher = teachers.find(i => i.id === form.watch('teacherId'))
                    return teacher
                      ? (
                          <div className="
                            flex items-center gap-2 text-emerald-500
                          "
                          >
                            <div className="size-2 rounded-full bg-emerald-500" />
                            <span>{teacher.name}</span>
                          </div>
                        )
                      : undefined
                  })()
                : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="
            bg-popover/90 border-border/40 rounded-xl backdrop-blur-xl
          "
          >
            {teachers.map(t => (
              <SelectItem
                key={t.id}
                value={t.id}
                className="
                  focus:bg-primary/10 focus:text-primary
                  rounded-lg font-medium
                "
              >
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.teacherId && (
          <p className="text-destructive pl-1 text-xs font-bold">{form.formState.errors.teacherId.message}</p>
        )}
      </div>

      {/* Classroom */}
      <div className="
        col-span-2 space-y-2
        sm:col-span-1
      "
      >
        <Label
          htmlFor="classroomId"
          className="
            text-muted-foreground/80 pl-1 text-[10px] font-black tracking-widest
            uppercase
          "
        >
          {t.classrooms.classroom()}
        </Label>
        <Select
          value={form.watch('classroomId') ?? 'none'}
          onValueChange={v => form.setValue('classroomId', v === 'none' || v === null ? undefined : v)}
        >
          <SelectTrigger
            id="classroomId"
            className="
              bg-background/50 border-border/40
              focus:ring-primary/20
              h-11 rounded-xl font-bold transition-all
            "
          >
            <SelectValue placeholder={t.common.optional()}>
              {form.watch('classroomId') && form.watch('classroomId') !== 'none'
                ? (() => {
                    const c = classrooms.find(i => i.id === form.watch('classroomId'))
                    return c
                      ? (
                          <div className="text-accent flex items-center gap-2">
                            <div className="bg-accent size-2 rounded-full" />
                            <span>{c.name}</span>
                          </div>
                        )
                      : undefined
                  })()
                : form.watch('classroomId') === 'none' || !form.watch('classroomId')
                  ? (
                      <span className="
                        text-muted-foreground/60 font-medium lowercase italic
                      "
                      >
                        {t.common.none()}
                      </span>
                    )
                  : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="
            bg-popover/90 border-border/40 rounded-xl backdrop-blur-xl
          "
          >
            <SelectItem
              value="none"
              className="
                focus:bg-primary/10
                text-muted-foreground rounded-lg italic
              "
            >
              {t.common.none()}
            </SelectItem>
            {classrooms.map(c => (
              <SelectItem
                key={c.id}
                value={c.id}
                className="
                  focus:bg-primary/10 focus:text-primary
                  rounded-lg font-medium
                "
              >
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Day of Week */}
      <div className="
        col-span-2 space-y-2
        sm:col-span-1
      "
      >
        <Label
          htmlFor="dayOfWeek"
          className="
            text-muted-foreground/80 pl-1 text-[10px] font-black tracking-widest
            uppercase
          "
        >
          {t.timetables.day()}
        </Label>
        <Select
          value={String(form.watch('dayOfWeek'))}
          onValueChange={v => form.setValue('dayOfWeek', Number(v))}
        >
          <SelectTrigger
            id="dayOfWeek"
            className="
              bg-background/50 border-border/40
              focus:ring-primary/20
              h-11 rounded-xl font-bold transition-all
            "
          >
            <SelectValue>
              {form.watch('dayOfWeek') && (
                <div className="flex items-center gap-2">
                  <IconCalendar className="text-primary/60 size-3.5" />
                  <span>{dayOfWeekLabels[form.watch('dayOfWeek')]}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="
            bg-popover/90 border-border/40 rounded-xl backdrop-blur-xl
          "
          >
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <SelectItem
                key={d}
                value={String(d)}
                className="
                  focus:bg-primary/10 focus:text-primary
                  rounded-lg font-medium
                "
              >
                {dayOfWeekLabels[d]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Times */}
      <div className="
        col-span-2 space-y-2
        sm:col-span-1
      "
      >
        <Label
          htmlFor="startTime"
          className="
            text-muted-foreground/80 pl-1 text-[10px] font-black tracking-widest
            uppercase
          "
        >
          {t.timetables.startTime()}
        </Label>
        <Input
          id="startTime"
          type="time"
          lang="fr"
          className="
            bg-background/50 border-border/40 h-11 rounded-xl font-bold
            tabular-nums transition-all
          "
          {...form.register('startTime')}
        />
        {form.formState.errors.startTime && (
          <p className="text-destructive pl-1 text-xs font-bold">
            {form.formState.errors.startTime.message}
          </p>
        )}
      </div>
      <div className="
        col-span-2 space-y-2
        sm:col-span-1
      "
      >
        <Label
          htmlFor="endTime"
          className="
            text-muted-foreground/80 pl-1 text-[10px] font-black tracking-widest
            uppercase
          "
        >
          {t.timetables.endTime()}
        </Label>
        <Input
          id="endTime"
          type="time"
          lang="fr"
          className="
            bg-background/50 border-border/40 h-11 rounded-xl font-bold
            tabular-nums transition-all
          "
          {...form.register('endTime')}
        />
        {form.formState.errors.endTime && (
          <p className="text-destructive pl-1 text-xs font-bold">
            {form.formState.errors.endTime.message}
          </p>
        )}
      </div>

      {/* Color */}
      <div className="col-span-2 space-y-2">
        <Label
          htmlFor="color"
          className="
            text-muted-foreground/80 pl-1 text-[10px] font-black tracking-widest
            uppercase
          "
        >
          {t.common.color()}
        </Label>
        <div className="flex items-center gap-4">
          <Input
            id="color"
            type="color"
            className="
              border-border/40 bg-background/50 h-12 w-20 cursor-pointer
              rounded-xl p-1
            "
            {...form.register('color')}
          />
          <div className="border-border/40 h-12 flex-1 rounded-xl border" style={{ backgroundColor: form.watch('color') }} />
        </div>
      </div>

      {/* Notes */}
      <div className="col-span-2 space-y-2">
        <Label
          htmlFor="notes"
          className="
            text-muted-foreground/80 pl-1 text-[10px] font-black tracking-widest
            uppercase
          "
        >
          {t.common.notes()}
        </Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder={t.common.optional()}
          className="
            bg-background/50 border-border/40 resize-none rounded-xl font-medium
            transition-all
          "
          {...form.register('notes')}
        />
      </div>
    </div>
  )
}
