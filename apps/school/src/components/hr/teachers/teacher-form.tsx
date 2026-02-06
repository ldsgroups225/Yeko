import type { TeacherFormData } from '@/schemas/teacher'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBook, IconInfoCircle, IconLoader2, IconSchool, IconShield } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import { DatePicker } from '@workspace/ui/components/date-picker'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { UserCombobox } from '@/components/hr/staff/user-combobox'
import { SubjectMultiSelect } from '@/components/hr/teachers/subject-multi-select'
import { useTranslations } from '@/i18n'
import { teacherCreateSchema } from '@/schemas/teacher'
import { createNewTeacher, updateExistingTeacher } from '@/school/functions/teachers'

interface TeacherFormProps {
  teacher?: TeacherFormData & { id: string }
  onSuccess?: () => void
}

export function TeacherForm({ teacher, onSuccess }: TeacherFormProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const isEditing = !!teacher

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TeacherFormData>({
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
          userId: '',
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
      toast.success(t.hr.teachers.createSuccess())
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || t.errors.generic())
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      return await updateExistingTeacher({
        data: {
          teacherId: teacher!.id,
          data,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['teacher', teacher!.id] })
      toast.success(t.hr.teachers.updateSuccess())
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || t.errors.generic())
    },
  })

  const onSubmit = (data: TeacherFormData) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconInfoCircle className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-serif font-semibold">{t.hr.teachers.basicInfo()}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {!isEditing && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="userId" className="flex items-center gap-1.5 font-semibold text-foreground">
                {t.hr.teachers.selectUser()}
                <span className="text-destructive">*</span>
              </Label>
              <UserCombobox
                id="userId"
                value={watch('userId')}
                onSelect={(userId) => {
                  setValue('userId', userId, { shouldValidate: true })
                }}
              />
              <p className="text-[10px] text-muted-foreground ml-1">
                {t.hr.teachers.userIdHelp()}
              </p>
              {errors.userId && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-medium text-destructive">{String(errors.userId.message)}</motion.p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="specialization" className="font-semibold text-foreground">{t.hr.teachers.specialization()}</Label>
            <Input
              id="specialization"
              {...register('specialization')}
              placeholder={t.hr.teachers.specializationPlaceholder()}
              className="rounded-xl h-11 border-border/40 bg-background/50 focus:bg-background transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hireDate" className="font-semibold text-foreground">{t.hr.teachers.hireDate()}</Label>
            <DatePicker
              captionLayout="dropdown"
              date={watch('hireDate') || undefined}
              onSelect={date => setValue('hireDate', date)}
              placeholder={t.hr.teachers.selectHireDate()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="flex items-center gap-1.5 font-semibold text-foreground">
              {t.hr.common.status()}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('status')}
              onValueChange={value => setValue('status', value as 'active' | 'inactive' | 'on_leave')}
            >
              <SelectTrigger className="rounded-xl h-11 border-border/40 bg-background/50 focus:bg-background transition-all">
                <SelectValue>
                  {watch('status') && (() => {
                    const statusConfig = {
                      active: { color: 'bg-emerald-500', label: t.hr.status.active() },
                      inactive: { color: 'bg-slate-400', label: t.hr.status.inactive() },
                      on_leave: { color: 'bg-amber-500', label: t.hr.status.on_leave() },
                    }
                    const config = statusConfig[watch('status') as keyof typeof statusConfig]
                    return (
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${config.color}`} />
                        <span>{config.label}</span>
                      </div>
                    )
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                <SelectItem value="active" className="rounded-lg py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    {t.hr.status.active()}
                  </div>
                </SelectItem>
                <SelectItem value="inactive" className="rounded-lg py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                    {t.hr.status.inactive()}
                  </div>
                </SelectItem>
                <SelectItem value="on_leave" className="rounded-lg py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    {t.hr.status.on_leave()}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-medium text-destructive">{String(errors.status.message)}</motion.p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconBook className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-serif font-semibold">{t.hr.teachers.subjectAssignment()}</h2>
        </div>
        <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
          {t.hr.teachers.subjectAssignmentDescription()}
        </p>
        <div className="space-y-4">
          <Label htmlFor="subjectIds" className="flex items-center gap-1.5 font-semibold text-foreground">
            {t.hr.teachers.subjects()}
            <span className="text-destructive">*</span>
          </Label>
          <SubjectMultiSelect
            value={watch('subjectIds') || []}
            onChange={(subjectIds) => {
              setValue('subjectIds', subjectIds, { shouldValidate: true })
            }}
          />
          {errors.subjectIds && (
            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-medium text-destructive">{String(errors.subjectIds.message)}</motion.p>
          )}
        </div>
      </motion.div>

      <div className="flex justify-end items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onSuccess?.()}
          className="rounded-xl px-6 hover:bg-muted font-medium"
        >
          {t.common.cancel()}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-xl px-8 min-w-[140px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          {isLoading
            ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )
            : isEditing
              ? (
                  <IconShield className="mr-2 h-4 w-4" />
                )
              : (
                  <IconSchool className="mr-2 h-4 w-4" />
                )}
          {isEditing ? t.common.save() : t.common.create()}
        </Button>
      </div>
    </form>
  )
}
