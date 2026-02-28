import type { getClasses } from '@/school/functions/classes'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconCheck, IconLoader2 } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import { motion } from 'motion/react'
import { FormProvider, useForm } from 'react-hook-form'
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
import { ClassFormFields } from './class-form-fields'

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
  const teachers = teachersResult.success ? teachersResult.data.teachers : []

  const defaultSchoolYearId = classData?.class.schoolYearId || schoolYearId || currentSchoolYear?.id || ''

  const methods = useForm<ClassFormData>({
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

  if (!schoolYearId && !currentSchoolYear && !isEditing) {
    return (
      <div className="text-muted-foreground p-4 text-center">
        <p>{t.classes.noSchoolYearSelected()}</p>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <ClassFormFields
          grades={grades}
          series={series}
          classrooms={classrooms}
          teachers={teachers}
        />

        <div className="border-border/10 flex justify-end gap-3 border-t pt-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="
              bg-primary
              hover:bg-primary/90
              shadow-primary/20 min-w-[120px] shadow-lg
            "
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
    </FormProvider>
  )
}
