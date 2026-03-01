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
          <h2 className="font-serif text-xl font-semibold">{t.hr.staff.basicInfo()}</h2>
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
                {t.hr.staff.selectUser()}
                <span className="text-destructive">*</span>
              </Label>
              <UserCombobox
                id="userId"
                value={watch('userId')}
                onSelect={userId => setValue('userId', userId)}
              />
              <p className="text-muted-foreground ml-1 text-[10px]">
                {t.hr.staff.userIdHelp()}
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
              htmlFor="position"
              className="
                text-foreground flex items-center gap-1.5 font-semibold
              "
            >
              {t.hr.staff.position()}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('position')}
              onValueChange={(value) => {
                setValue('position', value as StaffFormData['position'], { shouldValidate: true })
              }}
            >
              <SelectTrigger className="
                border-border/40 bg-background/50
                focus:bg-background
                h-11 rounded-xl transition-all
              "
              >
                <SelectValue placeholder={t.hr.staff.selectPosition()}>
                  {watch('position')
                    ? (() => {
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
                            <IconBriefcase className="
                              text-muted-foreground h-3.5 w-3.5
                            "
                            />
                            {positionTranslations[watch('position') as keyof typeof positionTranslations]()}
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
                    <SelectItem
                      key={position}
                      value={position}
                      className="rounded-lg py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <IconBriefcase className="
                          text-muted-foreground h-3.5 w-3.5
                        "
                        />
                        {positionTranslations[position]()}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.position && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-destructive text-xs font-medium"
              >
                {String(errors.position.message)}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="department"
              className="text-foreground font-semibold"
            >
              {t.hr.staff.department()}
            </Label>
            <Input
              id="department"
              {...register('department')}
              placeholder={t.hr.staff.departmentPlaceholder()}
              className="
                border-border/40 bg-background/50
                focus:bg-background
                h-11 rounded-xl transition-all
              "
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hireDate" className="text-foreground font-semibold">{t.hr.staff.hireDate()}</Label>
            <DatePicker
              captionLayout="dropdown"
              date={watch('hireDate') || undefined}
              onSelect={date => setValue('hireDate', date)}
              placeholder={t.hr.staff.selectHireDate()}
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
                  {watch('status') === 'active'
                    ? (
                        <div className="flex items-center gap-2">
                          <div className="bg-success h-2 w-2 rounded-full" />
                          {t.hr.status.active()}
                        </div>
                      )
                    : watch('status') === 'inactive'
                      ? (
                          <div className="flex items-center gap-2">
                            <div className="
                              bg-muted-foreground h-2 w-2 rounded-full
                            "
                            />
                            {t.hr.status.inactive()}
                          </div>
                        )
                      : (
                          <div className="flex items-center gap-2">
                            <div className="bg-accent h-2 w-2 rounded-full" />
                            {t.hr.status.on_leave()}
                          </div>
                        )}
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

      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          disabled={isSubmitting}
          className="
            hover:bg-muted
            rounded-xl px-6 font-medium
          "
        >
          {t.common.cancel()}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="
            shadow-primary/20 min-w-[140px] rounded-xl px-8 font-semibold
            shadow-lg transition-all
            hover:scale-[1.02]
            active:scale-[0.98]
          "
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
