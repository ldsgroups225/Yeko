import type { RoleFormData } from '@/schemas/role'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { generateSlug, roleSchema } from '@/schemas/role'
import { PermissionsMatrix } from './permissions-matrix'

interface RoleFormProps {
  initialData?: any
  onSubmit: (data: RoleFormData) => Promise<void>
}

export function RoleForm({ initialData, onSubmit }: RoleFormProps) {
  const { t } = useTranslation()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<any>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description || '',
          permissions: initialData.permissions || {},
          scope: initialData.scope || 'school',
        }
      : {
          permissions: {},
          scope: 'school',
        },
  })

  const name = watch('name')
  const permissions = watch('permissions')

  // Auto-generate slug from name (only for new roles)
  useEffect(() => {
    if (!isEditing && name) {
      setValue('slug', generateSlug(name))
    }
  }, [name, isEditing, setValue])

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('hr.roles.basicInfo')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('hr.roles.name')}
              {' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('hr.roles.namePlaceholder')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{String(errors.name.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              {t('hr.roles.slug')}
              {' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder={t('hr.roles.slugPlaceholder')}
              disabled={isEditing}
              className="font-mono"
              aria-invalid={!!errors.slug}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{String(errors.slug.message)}</p>
            )}
            {!isEditing && (
              <p className="text-xs text-muted-foreground">
                {t('hr.roles.slugHelp')}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">{t('hr.roles.description')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('hr.roles.descriptionPlaceholder')}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('hr.roles.permissions')}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t('hr.roles.permissionsDescription')}
        </p>
        <PermissionsMatrix
          value={permissions}
          onChange={newPermissions => setValue('permissions', newPermissions)}
        />
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
  )
}
