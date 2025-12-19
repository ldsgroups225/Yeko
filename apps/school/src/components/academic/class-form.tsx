import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
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

interface ClassFormProps {
  classData?: any
  onSuccess?: () => void
}

export function ClassForm({ classData, onSuccess }: ClassFormProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEditing = !!classData
  const { schoolYearId } = useSchoolYearContext()

  const { data: schoolYears } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
  })

  // Find the current school year from context or use the first one
  const currentSchoolYear = schoolYears?.find((sy: any) => sy.id === schoolYearId) || schoolYears?.[0]

  const { data: grades } = useSuspenseQuery({
    queryKey: ['grades'],
    queryFn: () => getGrades({ data: {} }),
  })

  const { data: series } = useSuspenseQuery({
    queryKey: ['series'],
    queryFn: () => getSeries({ data: {} }),
  })

  const { data: classrooms } = useSuspenseQuery({
    queryKey: ['classrooms'],
    queryFn: () => getClassrooms({ data: {} }),
  })

  const { data: teachersData } = useSuspenseQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ data: {} }),
  })

  const defaultSchoolYearId = classData?.schoolYearId || schoolYearId || currentSchoolYear?.id || ''

  const { register, handleSubmit, setValue, watch, formState: { errors }, control } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      schoolYearId: defaultSchoolYearId,
      gradeId: classData?.gradeId || '',
      seriesId: classData?.seriesId || null,
      section: classData?.section || '',
      classroomId: classData?.classroomId || null,
      homeroomTeacherId: classData?.homeroomTeacherId || null,
      status: classData?.status || 'active',
      maxStudents: classData?.maxStudents || 40,
    },
  })

  const mutation = useMutation({
    mutationFn: (formData: ClassFormData) =>
      isEditing
        ? updateClass({ data: { id: classData.id, updates: formData } })
        : createClass({ data: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success(isEditing ? t('academic.classes.updateSuccess') : t('academic.classes.createSuccess'))
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.message || t('academic.classes.saveFailed'))
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
        <p>{t('academic.classes.noSchoolYearSelected')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gradeId">
            {t('academic.classes.grade')}
            {' '}
            *
          </Label>
          <Controller
            name="gradeId"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('academic.classes.selectGrade')} />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.gradeId && <p className="text-sm text-destructive">{errors.gradeId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="seriesId">{t('academic.classes.series')}</Label>
          <Select value={watch('seriesId') || '__none__'} onValueChange={v => setValue('seriesId', v === '__none__' ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('academic.classes.selectSeries')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t('common.none')}</SelectItem>
              {series.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="section">
            {t('academic.classes.section')}
            {' '}
            *
          </Label>
          <Input id="section" {...register('section')} placeholder={t('placeholders.classSection')} />
          {errors.section && <p className="text-sm text-destructive">{errors.section.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxStudents">
            {t('academic.classes.maxStudents')}
            {' '}
            *
          </Label>
          <Input id="maxStudents" type="number" {...register('maxStudents', { valueAsNumber: true })} />
          {errors.maxStudents && <p className="text-sm text-destructive">{errors.maxStudents.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="classroomId">{t('academic.classes.classroom')}</Label>
          <Select value={watch('classroomId') || '__none__'} onValueChange={v => setValue('classroomId', v === '__none__' ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('academic.classes.selectClassroom')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t('common.none')}</SelectItem>
              {classrooms.map((c: any) => (
                <SelectItem key={c.classroom.id} value={c.classroom.id}>
                  {c.classroom.name}
                  {' '}
                  (
                  {c.classroom.code}
                  )
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="homeroomTeacherId">{t('academic.classes.homeroomTeacher')}</Label>
          <Select value={watch('homeroomTeacherId') || '__none__'} onValueChange={v => setValue('homeroomTeacherId', v === '__none__' ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('academic.classes.selectTeacher')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t('common.none')}</SelectItem>
              {teachersData.teachers.map((t: any) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            {t('common.status')}
            {' '}
            *
          </Label>
          <Select value={watch('status') || 'active'} onValueChange={v => setValue('status', v as 'active' | 'archived')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('common.active')}</SelectItem>
              <SelectItem value="archived">{t('common.archived')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>
  )
}
