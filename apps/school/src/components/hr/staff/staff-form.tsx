import type { StaffFormData } from '@/schemas/staff'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBriefcase, IconInfoCircle, IconLoader2, IconShield } from '@tabler/icons-react'
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
import { UserCombobox } from '@/components/hr/staff/user-combobox'
import { useTranslations } from '@/i18n'
import { staffPositions, staffSchema } from '@/schemas/staff'

interface StaffFormProps {
  initialData?: StaffFormData & { id: string }
  onSubmit: (data: StaffFormData) => Promise<void>
}

export function StaffForm({ initialData, onSubmit }: StaffFormProps) {
  const t = useTranslations()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: initialData
      ? {
          userId: initialData.userId,
          position: initialData.position,
          department: initialData.department || '',
          hireDate: initialData.hireDate
            ? new Date(initialData.hireDate)
            : undefined,
          status: initialData.status,
        }
      : {
          userId: '',
          position: '' as StaffFormData['position'],
          department: '',
          status: 'active',
          hireDate: undefined,
        },
  })

  const handleFormSubmit = async (data: StaffFormData) => {
    const formData = {
      ...data,
      hireDate: data.hireDate || null,
    }
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconInfoCircle className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-serif font-semibold">{t.hr.staff.basicInfo()}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {!isEditing && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="userId" className="flex items-center gap-1.5 font-semibold text-foreground">
                {t.hr.staff.selectUser()}
                <span className="text-destructive">*</span>
              </Label>
              <UserCombobox
                id="userId"
                value={watch('userId')}
                onSelect={userId => setValue('userId', userId)}
              />
              {errors.userId && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-medium text-destructive">{String(errors.userId.message)}</motion.p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="position" className="flex items-center gap-1.5 font-semibold text-foreground">
              {t.hr.staff.position()}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('position')}
              onValueChange={value => setValue('position', value as StaffFormData['position'])}
            >
              <SelectTrigger className="rounded-xl h-11 border-border/40 bg-background/50 focus:bg-background transition-all">
                <SelectValue placeholder={t.hr.staff.selectPosition()}>
                  {watch('position') && (() => {
                    const positionTranslations = {
                      academic_coordinator: t.hr.positions.academic_coordinator,
                      discipline_officer: t.hr.positions.discipline_officer,
                      accountant: t.hr.positions.accountant,
                      cashier: t.hr.positions.cashier,
                      registrar: t.hr.positions.registrar,
                      other: t.hr.positions.other,
                    }
                    return (
                      <div className="flex items-center gap-2">
                        <IconBriefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        {positionTranslations[watch('position') as keyof typeof positionTranslations]()}
                      </div>
                    )
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                {staffPositions.map((position) => {
                  const positionTranslations = {
                    academic_coordinator: t.hr.positions.academic_coordinator,
                    discipline_officer: t.hr.positions.discipline_officer,
                    accountant: t.hr.positions.accountant,
                    cashier: t.hr.positions.cashier,
                    registrar: t.hr.positions.registrar,
                    other: t.hr.positions.other,
                  }
                  return (
                    <SelectItem key={position} value={position} className="rounded-lg py-2.5">
                      <div className="flex items-center gap-2">
                        <IconBriefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        {positionTranslations[position]()}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.position && (
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-medium text-destructive">{String(errors.position.message)}</motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="font-semibold text-foreground">{t.hr.staff.department()}</Label>
            <Input
              id="department"
              {...register('department')}
              placeholder={t.hr.staff.departmentPlaceholder()}
              className="rounded-xl h-11 border-border/40 bg-background/50 focus:bg-background transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hireDate" className="font-semibold text-foreground">{t.hr.staff.hireDate()}</Label>
            <DatePicker
              date={watch('hireDate') || undefined}
              onSelect={date => setValue('hireDate', date)}
              placeholder={t.hr.staff.selectHireDate()}
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
                  {watch('status') === 'active'
                    ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          {t.hr.status.active()}
                        </div>
                      )
                    : watch('status') === 'inactive'
                      ? (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-slate-400" />
                            {t.hr.status.inactive()}
                          </div>
                        )
                      : (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            {t.hr.status.on_leave()}
                          </div>
                        )}
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

      <div className="flex justify-end items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          disabled={isSubmitting}
          className="rounded-xl px-6 hover:bg-muted font-medium"
        >
          {t.common.cancel()}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl px-8 min-w-[140px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          {isSubmitting
            ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )
            : isEditing
              ? (
                  <IconShield className="mr-2 h-4 w-4" />
                )
              : (
                  <IconBriefcase className="mr-2 h-4 w-4" />
                )}
          {isEditing ? t.common.save() : t.common.create()}
        </Button>
      </div>
    </form>
  )
}
