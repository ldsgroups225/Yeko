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
import { schoolMutationKeys } from '@/lib/queries/keys'
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
    mutationKey: schoolMutationKeys.teachers.create,
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
    mutationKey: schoolMutationKeys.teachers.update,
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

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          border-border/40 bg-card/50 rounded-xl border p-8 shadow-sm
          backdrop-blur-xl
        "
      >
        <div className="mb-8 flex items-center gap-2">
          <div className="
            bg-primary/10 text-primary flex h-8 w-8 items-center justify-center
            rounded-lg
          "
          >
            <IconInfoCircle className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-semibold">{t.hr.teachers.basicInfo()}</h2>
        </div>

        <div className="
          grid gap-6
          md:grid-cols-2
        "
        >
          {!isEditing && (
            <div className="
              space-y-2
              md:col-span-2
            "
            >
              <Label
                htmlFor="userId"
                className="
                  text-foreground flex items-center gap-1.5 font-semibold
                "
              >
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
              <p className="text-muted-foreground ml-1 text-[10px]">
                {t.hr.teachers.userIdHelp()}
              </p>
              {errors.userId && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-destructive text-xs font-medium"
                >
                  {String(errors.userId.message)}
                </motion.p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="specialization"
              className="text-foreground font-semibold"
            >
              {t.hr.teachers.specialization()}
            </Label>
            <Input
              id="specialization"
              {...register('specialization')}
              placeholder={t.hr.teachers.specializationPlaceholder()}
              className="
                border-border/40 bg-background/50
                focus:bg-background
                h-11 rounded-xl transition-all
              "
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hireDate" className="text-foreground font-semibold">{t.hr.teachers.hireDate()}</Label>
            <DatePicker
              captionLayout="dropdown"
              date={watch('hireDate') || undefined}
              onSelect={date => setValue('hireDate', date)}
              placeholder={t.hr.teachers.selectHireDate()}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="status"
              className="
                text-foreground flex items-center gap-1.5 font-semibold
              "
            >
              {t.hr.common.status()}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('status')}
              onValueChange={value => setValue('status', value as 'active' | 'inactive' | 'on_leave')}
            >
              <SelectTrigger className="
                border-border/40 bg-background/50
                focus:bg-background
                h-11 rounded-xl transition-all
              "
              >
                <SelectValue>
                  {watch('status')
                    ? (() => {
                        const statusConfig = {
                          active: { color: 'bg-success', label: t.hr.status.active() },
                          inactive: { color: 'bg-muted-foreground', label: t.hr.status.inactive() },
                          on_leave: { color: 'bg-accent', label: t.hr.status.on_leave() },
                        }
                        const config = statusConfig[watch('status') as keyof typeof statusConfig]
                        return (
                          <div className="flex items-center gap-2">
                            <div className={`
                              h-2 w-2 rounded-full
                              ${config.color}
                            `}
                            />
                            <span>{config.label}</span>
                          </div>
                        )
                      })()
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="
                bg-popover/90 border-border/40 rounded-xl backdrop-blur-2xl
              "
              >
                <SelectItem value="active" className="rounded-lg py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="bg-success h-2 w-2 rounded-full" />
                    {t.hr.status.active()}
                  </div>
                </SelectItem>
                <SelectItem value="inactive" className="rounded-lg py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="bg-muted-foreground h-2 w-2 rounded-full" />
                    {t.hr.status.inactive()}
                  </div>
                </SelectItem>
                <SelectItem value="on_leave" className="rounded-lg py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="bg-accent h-2 w-2 rounded-full" />
                    {t.hr.status.on_leave()}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-destructive text-xs font-medium"
              >
                {String(errors.status.message)}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="
          border-border/40 bg-card/50 rounded-xl border p-8 shadow-sm
          backdrop-blur-xl
        "
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="
            bg-primary/10 text-primary flex h-8 w-8 items-center justify-center
            rounded-lg
          "
          >
            <IconBook className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-semibold">{t.hr.teachers.subjectAssignment()}</h2>
        </div>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          {t.hr.teachers.subjectAssignmentDescription()}
        </p>
        <div className="space-y-4">
          <Label
            htmlFor="subjectIds"
            className="text-foreground flex items-center gap-1.5 font-semibold"
          >
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
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-destructive text-xs font-medium"
            >
              {String(errors.subjectIds.message)}
            </motion.p>
          )}
        </div>
      </motion.div>

      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onSuccess?.()}
          className="
            hover:bg-muted
            rounded-xl px-6 font-medium
          "
        >
          {t.common.cancel()}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="
            shadow-primary/20 min-w-[140px] rounded-xl px-8 font-semibold
            shadow-lg transition-all
            hover:scale-[1.02]
            active:scale-[0.98]
          "
        >
          {isPending
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
