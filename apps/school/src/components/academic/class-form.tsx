import type { getClasses } from '@/school/functions/classes'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconActivity, IconCalendar, IconCheck, IconLayoutGrid, IconLoader2, IconSchool, IconUser, IconUsers } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { motion } from 'motion/react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { createClass, updateClass } from '@/school/functions/classes'
import { getClassrooms } from '@/school/functions/classrooms'
import { getGrades } from '@/school/functions/grades'
import { getSchoolYears } from '@/school/functions/school-years'
import { getSeries } from '@/school/functions/series'
import { getTeachers } from '@/school/functions/teachers'

const classSchema = z.object({
  schoolYearId: z.string().min(1, 'School year is required'),
  gradeId: z.string().min(1, 'Grade is required'),
  seriesId: z.string().nullable().optional(),
  section: z.string().min(1, 'Section is required'),
  classroomId: z.string().nullable().optional(),
  homeroomTeacherId: z.string().nullable().optional(),
  maxStudents: z.number().int().min(1).max(100),
  status: z.enum(['active', 'archived']),
})

type ClassFormData = z.infer<typeof classSchema>
type ClassInfo = Extract<Awaited<ReturnType<typeof getClasses>>, { success: true }>['data'][number]

interface ClassFormProps {
  classData?: ClassInfo
  onSuccess?: () => void
}

export function ClassForm({ classData, onSuccess }: ClassFormProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const isEditing = !!classData
  const { schoolYearId } = useSchoolYearContext()

  const { data: schoolYearsResult } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
  })

  const schoolYears = schoolYearsResult?.success ? schoolYearsResult.data : []

  // Find the current school year from context or use the first one
  const currentSchoolYear = schoolYears?.find(sy => sy.id === schoolYearId) || schoolYears?.[0]

  const { data: gradesResult } = useSuspenseQuery({
    queryKey: ['grades'],
    queryFn: () => getGrades({ data: {} }),
  })
  const grades = gradesResult.success ? gradesResult.data : []

  const { data: seriesResult } = useSuspenseQuery({
    queryKey: ['series'],
    queryFn: () => getSeries({ data: {} }),
  })
  const series = seriesResult.success ? seriesResult.data : []

  const { data: classroomsResult } = useSuspenseQuery({
    queryKey: ['classrooms'],
    queryFn: () => getClassrooms({ data: {} }),
  })
  const classrooms = classroomsResult.success ? classroomsResult.data : []

  const { data: teachersResult } = useSuspenseQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ data: {} }),
  })
  const teachersData = teachersResult.success ? teachersResult.data : { teachers: [] }

  const defaultSchoolYearId = classData?.class.schoolYearId || schoolYearId || currentSchoolYear?.id || ''

  const { register, handleSubmit, setValue, watch, formState: { errors }, control } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      schoolYearId: defaultSchoolYearId,
      gradeId: classData?.class.gradeId || '',
      seriesId: classData?.class.seriesId || null,
      section: classData?.class.section || '',
      classroomId: classData?.class.classroomId || null,
      homeroomTeacherId: classData?.class.homeroomTeacherId || null,
      status: classData?.class.status || 'active',
      maxStudents: classData?.class.maxStudents || 40,
    },
  })

  const mutation = useMutation({
    mutationKey: isEditing ? schoolMutationKeys.classes.update : schoolMutationKeys.classes.create,
    mutationFn: async (data: ClassFormData) => {
      if (isEditing) {
        return updateClass({ data: { id: classData!.class.id, updates: data } })
      }
      return createClass({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success(isEditing ? t.classes.updateSuccess() : t.classes.createSuccess())
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || t.classes.saveFailed())
    },
  })

  const onSubmit = (data: ClassFormData) => {
    mutation.mutate(data)
  }

  const onFormError = (formErrors: Record<string, any>) => {
    console.error('Form validation errors:', formErrors)
    const firstError = Object.values(formErrors)[0]
    if (firstError?.message) {
      toast.error(String(firstError.message))
    }
  }

  if (!schoolYearId && !currentSchoolYear && !isEditing) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>{t.classes.noSchoolYearSelected()}</p>
      </div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit, onFormError)}
      className="space-y-6"
    >
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
              {errors.gradeId.message}
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
              {errors.section.message}
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
              {errors.maxStudents.message}
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
                  ? teachersData.teachers.find(tr => tr.id === watch('homeroomTeacherId'))?.user.name
                  : t.common.none()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="backdrop-blur-xl bg-card/95 border-border/10">
              <SelectItem value="__none__">{t.common.none()}</SelectItem>
              {teachersData.teachers.map(teacher => (
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

      <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="min-w-[120px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          {mutation.isPending
            ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )
            : (
                <IconCheck className="mr-2 h-4 w-4" />
              )}
          {isEditing ? t.common.update() : t.common.create()}
        </Button>
      </div>
    </motion.form>
  )
}
