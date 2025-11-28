import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { staffSchema, staffPositions, type StaffFormData } from '@/schemas/staff';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface StaffFormProps {
  initialData?: any;
  onSubmit: (data: StaffFormData) => Promise<void>;
}

export function StaffForm({ initialData, onSubmit }: StaffFormProps) {
  const { t } = useTranslation();
  const isEditing = !!initialData;

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
          ? new Date(initialData.hireDate).toISOString().split('T')[0]
          : '',
        status: initialData.status,
      }
      : {
        status: 'active',
      },
  });

  const handleFormSubmit = async (data: any) => {
    // Convert date string to Date object if present
    const formData = {
      ...data,
      hireDate: data.hireDate ? new Date(data.hireDate) : null,
    };
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('hr.staff.basicInfo')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {!isEditing && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="userId">
                {t('hr.staff.selectUser')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="userId"
                {...register('userId')}
                placeholder={t('hr.staff.userIdPlaceholder')}
                aria-invalid={!!errors.userId}
              />
              {errors.userId && (
                <p className="text-sm text-destructive">{String(errors.userId.message)}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('hr.staff.userIdHelp')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="position">
              {t('hr.staff.position')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('position')}
              onValueChange={(value) => setValue('position', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('hr.staff.selectPosition')} />
              </SelectTrigger>
              <SelectContent>
                {staffPositions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {t(`hr.positions.${position}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="text-sm text-destructive">{String(errors.position.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">{t('hr.staff.department')}</Label>
            <Input
              id="department"
              {...register('department')}
              placeholder={t('hr.staff.departmentPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hireDate">{t('hr.staff.hireDate')}</Label>
            <Input
              id="hireDate"
              type="date"
              {...register('hireDate')}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              {t('hr.common.status')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value as any)}
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t('common.save') : t('common.create')}
        </Button>
      </div>
    </form>
  );
}
