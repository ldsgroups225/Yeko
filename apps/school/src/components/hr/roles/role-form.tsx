import type { RoleFormData } from '@/schemas/role'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconInfoCircle, IconKey, IconLoader2, IconShield } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from '@/i18n'
import { generateSlug, roleSchema } from '@/schemas/role'
import { PermissionsMatrix } from './permissions-matrix'

interface RoleFormProps {
  initialData?: RoleFormData & { id: string }
  onSubmit: (data: RoleFormData) => Promise<void>
}

export function RoleForm({ initialData, onSubmit }: RoleFormProps) {
  const t = useTranslations()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RoleFormData>({
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

  const handleFormSubmit = async (data: RoleFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconInfoCircle className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-serif font-semibold">{t.hr.roles.basicInfo()}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1.5 font-semibold text-foreground">
              {t.hr.roles.name()}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t.hr.roles.namePlaceholder()}
              className="rounded-xl border-border/40 bg-background/50 focus:bg-background transition-all h-11"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-medium text-destructive">{String(errors.name.message)}</motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-1.5 font-semibold text-foreground">
              {t.hr.roles.slug()}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="slug"
                {...register('slug')}
                placeholder={t.hr.roles.slugPlaceholder()}
                disabled={isEditing}
                className="font-mono rounded-xl border-border/40 bg-background/50 focus:bg-background transition-all h-11 pl-4"
                aria-invalid={!!errors.slug}
              />
              {isEditing && <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />}
            </div>
            {errors.slug && (
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-medium text-destructive">{String(errors.slug.message)}</motion.p>
            )}
            {!isEditing && (
              <p className="text-[10px] text-muted-foreground bg-muted/30 p-1.5 rounded-lg inline-block">
                {t.hr.roles.slugHelp()}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description" className="font-semibold text-foreground">{t.hr.roles.description()}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t.hr.roles.descriptionPlaceholder()}
              className="rounded-xl border-border/40 bg-background/50 focus:bg-background transition-all resize-none min-h-[100px]"
              rows={3}
            />
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
            <IconKey className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-serif font-semibold">{t.hr.roles.permissions()}</h2>
        </div>
        <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
          {t.hr.roles.permissionsDescription()}
        </p>
        <PermissionsMatrix
          value={permissions}
          onChange={newPermissions => setValue('permissions', newPermissions)}
        />
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
                  <IconLoader2 className="mr-2 h-4 w-4" />
                )}
          {isEditing ? t.common.save() : t.common.create()}
        </Button>
      </div>
    </form>
  )
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
