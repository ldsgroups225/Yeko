import type { TeacherFormData } from '@/schemas/teacher'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { teacherCreateSchema } from '@/schemas/teacher'
import { createNewTeacher, updateExistingTeacher } from '@/school/functions/teachers'

interface TeacherFormProps {
  teacher?: any
  onSuccess?: () => void
}

export function TeacherForm({ teacher, onSuccess }: TeacherFormProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEditing = !!teacher

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<any>({
    resolver: zodResolver(teacherCreateSchema),
    defaultValues: teacher
      ? {
        userId: teacher.userId,
        specialization: teacher.specialization || '',
        hireDate: teacher.hireDate
          ? new Date(teacher.hireDate)
          : undefined,
        status: teacher.status,
        subjectIds: teacher.subjectIds || [],
      }
      : {
        status: 'active',
        subjectIds: [],
        hireDate: undefined,
      },
  })

  const createMutation = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      return await createNewTeacher({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success(t('hr.teachers.createSuccess'))
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || t('errors.generic'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      return await updateExistingTeacher({
        data: {
          teacherId: teacher.id,
          data,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['teacher', teacher.id] })
      toast.success(t('hr.teachers.updateSuccess'))
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || t('errors.generic'))
    },
  })

  const onSubmit = (data: any) => {
    // Date is already a Date object from DatePicker
    const formData = {
      ...data,
      hireDate: data.hireDate || null,
    }

    if (isEditing) {
      updateMutation.mutate(formData)
    }
    else {
      createMutation.mutate(formData)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('hr.teachers.basicInfo')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {!isEditing && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="userId">
                {t('hr.teachers.selectUser')}
                {' '}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="userId"
                {...register('userId')}
                placeholder={t('hr.teachers.userIdPlaceholder')}
                aria-invalid={!!errors.userId}
              />
              {errors.userId && (
                <p className="text-sm text-destructive">{String(errors.userId.message)}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('hr.teachers.userIdHelp')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="specialization">{t('hr.teachers.specialization')}</Label>
            <Input
              id="specialization"
              {...register('specialization')}
              placeholder={t('hr.teachers.specializationPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hireDate">{t('hr.teachers.hireDate')}</Label>
            <DatePicker
              date={watch('hireDate')}
              onSelect={date => setValue('hireDate', date)}
              placeholder={t('hr.teachers.selectHireDate')}
              maxDate={new Date()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              {t('hr.common.status')}
              {' '}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('status')}
              onValueChange={value => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('hr.status.active')}</SelectItem>
                <SelectItem value="inactive">{t('hr.status.inactive')}</SelectItem>
                <SelectItem value="on_leave">{t('hr.status.on_leave')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{String(errors.status.message)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('hr.teachers.subjectAssignment')}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t('hr.teachers.subjectAssignmentDescription')}
        </p>
        <div className="space-y-2">
          <Label>{t('hr.teachers.subjects')}</Label>
          <p className="text-sm text-muted-foreground">
            {t('hr.teachers.subjectSelectionPlaceholder')}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t('common.save') : t('common.create')}
        </Button>
      </div>
    </form>
  )
}
