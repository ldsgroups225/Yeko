import type { StaffFormData } from '@/schemas/staff'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { UserCombobox } from '@/components/hr/staff/user-combobox'
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
import { useTranslations } from '@/i18n'
import { staffPositions, staffSchema } from '@/schemas/staff'

interface StaffFormProps {
  initialData?: any
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
  } = useForm<any>({
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
          position: '' as any,
          department: '',
          status: 'active',
          hireDate: undefined,
        },
  })

  const handleFormSubmit = async (data: any) => {
    // Date is already a Date object from DatePicker
    const formData = {
      ...data,
      hireDate: data.hireDate || null,
    }
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t.hr.staff.basicInfo()}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {!isEditing && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="userId">
                {t.hr.staff.selectUser()}
                {' '}
                <span className="text-destructive">*</span>
              </Label>
              <UserCombobox
                value={watch('userId')}
                onSelect={userId => setValue('userId', userId)}
              />
              {errors.userId && (
                <p className="text-sm text-destructive">{String(errors.userId.message)}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="position">
              {t.hr.staff.position()}
              {' '}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('position') || ''}
              onValueChange={value => setValue('position', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.hr.staff.selectPosition()} />
              </SelectTrigger>
              <SelectContent>
                {staffPositions.map((position) => {
                  const positionTranslations = {
                    academic_coordinator:
                      t.hr.positions.academic_coordinator,
                    discipline_officer:
                      t.hr.positions.discipline_officer,
                    accountant: t.hr.positions.accountant,
                    cashier: t.hr.positions.cashier,
                    registrar: t.hr.positions.registrar,
                    other: t.hr.positions.other,
                  }
                  return (
                    <SelectItem key={position} value={position}>
                      {positionTranslations[position]()}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="text-sm text-destructive">{String(errors.position.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">{t.hr.staff.department()}</Label>
            <Input
              id="department"
              {...register('department')}
              placeholder={t.hr.staff.departmentPlaceholder()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hireDate">{t.hr.staff.hireDate()}</Label>
            <DatePicker
              date={watch('hireDate')}
              onSelect={date => setValue('hireDate', date)}
              placeholder={t.hr.staff.selectHireDate()}
              maxDate={new Date()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              {t.hr.common.status()}
              {' '}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('status') || ''}
              onValueChange={value => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t.hr.status.active()}</SelectItem>
                <SelectItem value="inactive">{t.hr.status.inactive()}</SelectItem>
                <SelectItem value="on_leave">{t.hr.status.on_leave()}</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{String(errors.status.message)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          {t.common.cancel()}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t.common.save() : t.common.create()}
        </Button>
      </div>
    </form>
  )
}
