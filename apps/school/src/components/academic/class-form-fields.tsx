import type { Grade, Serie } from '@repo/data-ops/drizzle/core-schema'
import type { ClassroomWithDetails } from '@repo/data-ops/queries/classrooms'
import { IconActivity, IconCalendar, IconLayoutGrid, IconSchool, IconUser, IconUsers } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { motion } from 'motion/react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslations } from '@/i18n'

interface Teacher {
  id: string
  user: {
    name: string
  }
}

interface ClassFormFieldsProps {
  grades: Grade[]
  series: Serie[]
  classrooms: ClassroomWithDetails[]
  teachers: Teacher[]
}

export function ClassFormFields({ grades, series, classrooms, teachers }: ClassFormFieldsProps) {
  const t = useTranslations()
  const { register, control, watch, setValue, formState: { errors } } = useFormContext()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Grade Selection */}
      <div className="space-y-2">
        <Label htmlFor="gradeId" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <IconSchool className="h-3.5 w-3.5" />
          {t.classes.grade()}
          {' '}
          *
        </Label>
        <Controller
          name="gradeId"
          control={control}
          render={({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <SelectTrigger className="bg-white/5 border-border/10 focus:ring-primary/40 h-11">
                <SelectValue placeholder={t.classes.selectGrade()}>
                  {grades.find(g => g.id === field.value)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-card/95 border-border/10">
                {grades.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.gradeId && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[11px] font-medium text-destructive">
            {String(errors.gradeId.message)}
          </motion.p>
        )}
      </div>

      {/* Series Selection */}
      <div className="space-y-2">
        <Label htmlFor="seriesId" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <IconLayoutGrid className="h-3.5 w-3.5" />
          {t.classes.series()}
        </Label>
        <Select value={watch('seriesId') || '__none__'} onValueChange={v => setValue('seriesId', v === '__none__' ? null : v)}>
          <SelectTrigger className="bg-white/5 border-border/10 focus:ring-primary/40 h-11">
            <SelectValue placeholder={t.classes.selectSeries()}>
              {watch('seriesId')
                ? series.find(s => s.id === watch('seriesId'))?.name
                : t.common.none()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="backdrop-blur-xl bg-card/95 border-border/10">
            <SelectItem value="__none__">{t.common.none()}</SelectItem>
            {series.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Section Input */}
      <div className="space-y-2">
        <Label htmlFor="section" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <IconActivity className="h-3.5 w-3.5" />
          {t.classes.section()}
          {' '}
          *
        </Label>
        <Input
          id="section"
          {...register('section')}
          placeholder={t.placeholders.classSection()}
          className="bg-white/5 border-border/10 focus:ring-primary/40 h-11"
        />
        {errors.section && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[11px] font-medium text-destructive">
            {String(errors.section.message)}
          </motion.p>
        )}
      </div>

      {/* Max Students */}
      <div className="space-y-2">
        <Label htmlFor="maxStudents" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <IconUsers className="h-3.5 w-3.5" />
          {t.classes.maxStudents()}
          {' '}
          *
        </Label>
        <Input
          id="maxStudents"
          type="number"
          {...register('maxStudents', { valueAsNumber: true })}
          className="bg-white/5 border-border/10 focus:ring-primary/40 h-11 font-mono"
        />
        {errors.maxStudents && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[11px] font-medium text-destructive">
            {String(errors.maxStudents.message)}
          </motion.p>
        )}
      </div>

      {/* Classroom Selection */}
      <div className="space-y-2">
        <Label htmlFor="classroomId" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <IconCalendar className="h-3.5 w-3.5" />
          {t.classes.classroom()}
        </Label>
        <Select value={watch('classroomId') || '__none__'} onValueChange={v => setValue('classroomId', v === '__none__' ? null : v)}>
          <SelectTrigger className="bg-white/5 border-border/10 focus:ring-primary/40 h-11">
            <SelectValue placeholder={t.classes.selectClassroom()}>
              {watch('classroomId')
                ? (() => {
                    const c = classrooms.find(cr => cr.id === watch('classroomId'))
                    return c
                      ? (
                          <div className="flex items-center gap-2">
                            <span>{c.name}</span>
                            <Badge variant="outline" className="text-[10px] bg-white/5 border-border/10">{c.code}</Badge>
                          </div>
                        )
                      : null
                  })()
                : t.common.none()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="backdrop-blur-xl bg-card/95 border-border/10">
            <SelectItem value="__none__">{t.common.none()}</SelectItem>
            {classrooms.map(c => (
              <SelectItem key={c.id} value={c.id}>
                <div className="flex items-center justify-between w-full gap-2">
                  <span>{c.name}</span>
                  <Badge variant="outline" className="text-[10px] bg-white/5 border-border/10">{c.code}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Homeroom Teacher */}
      <div className="space-y-2">
        <Label htmlFor="homeroomTeacherId" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <IconUser className="h-3.5 w-3.5" />
          {t.classes.homeroomTeacher()}
        </Label>
        <Select value={watch('homeroomTeacherId') || '__none__'} onValueChange={v => setValue('homeroomTeacherId', v === '__none__' ? null : v)}>
          <SelectTrigger className="bg-white/5 border-border/10 focus:ring-primary/40 h-11">
            <SelectValue placeholder={t.classes.selectTeacher()}>
              {watch('homeroomTeacherId')
                ? teachers.find(tr => tr.id === watch('homeroomTeacherId'))?.user.name
                : t.common.none()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="backdrop-blur-xl bg-card/95 border-border/10">
            <SelectItem value="__none__">{t.common.none()}</SelectItem>
            {teachers.map(teacher => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Selection */}
      <div className="space-y-2">
        <Label htmlFor="status" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <IconActivity className="h-3.5 w-3.5" />
          {t.common.status()}
          {' '}
          *
        </Label>
        <Select value={watch('status') || 'active'} onValueChange={v => setValue('status', v as 'active' | 'archived')}>
          <SelectTrigger className="bg-white/5 border-border/10 focus:ring-primary/40 h-11">
            <SelectValue>
              {watch('status') === 'active'
                ? (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {t.common.active()}
                    </div>
                  )
                : (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      {t.common.archived()}
                    </div>
                  )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="backdrop-blur-xl bg-card/95 border-border/10">
            <SelectItem value="active">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                {t.common.active()}
              </div>
            </SelectItem>
            <SelectItem value="archived">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                {t.common.archived()}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
