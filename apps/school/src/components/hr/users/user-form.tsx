import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { userCreateSchema, type UserFormData } from '@/schemas/user';
import { createNewUser, updateExistingUser } from '@/school/functions/users';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UserFormProps {
  user?: any;
  onSuccess?: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: user
      ? {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        status: user.status,
        roleIds: user.roleIds || [],
      }
      : {
        status: 'active',
        roleIds: [],
      },
  });

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return await createNewUser({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('hr.users.createSuccess'));
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('errors.generic'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return await updateExistingUser({
        data: {
          userId: user.id,
          data,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      toast.success(t('hr.users.updateSuccess'));
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('errors.generic'));
    },
  });

  const onSubmit = (data: UserFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('hr.users.basicInfo')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('hr.common.name')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('hr.users.namePlaceholder')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {t('hr.common.email')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder={t('hr.users.emailPlaceholder')}
              aria-invalid={!!errors.email}
              disabled={isEditing}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('hr.common.phone')}</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder={t('hr.users.phonePlaceholder')}
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
                <SelectItem value="suspended">{t('hr.status.suspended')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="avatarUrl">{t('hr.common.avatar')}</Label>
            <Input
              id="avatarUrl"
              type="url"
              {...register('avatarUrl')}
              placeholder={t('hr.users.avatarPlaceholder')}
            />
            {errors.avatarUrl && (
              <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('hr.users.roleAssignment')}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t('hr.users.roleAssignmentDescription')}
        </p>
        <div className="space-y-2">
          <Label>{t('hr.common.roles')}</Label>
          <p className="text-sm text-muted-foreground">
            {t('hr.users.roleSelectionPlaceholder')}
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
  );
}
