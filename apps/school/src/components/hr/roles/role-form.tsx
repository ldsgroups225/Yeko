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
        className="
          border-border/40 bg-card/50 rounded-xl border p-8 shadow-sm
          backdrop-blur-xl
        "
      >
        <div className="mb-6 flex items-center gap-2">
          <div className="
            bg-primary/10 text-primary flex h-8 w-8 items-center justify-center
            rounded-lg
          "
          >
            <IconInfoCircle className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-semibold">{t.hr.roles.basicInfo()}</h2>
        </div>

        <div className="
          grid gap-6
          md:grid-cols-2
        "
        >
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="
                text-foreground flex items-center gap-1.5 font-semibold
              "
            >
              {t.hr.roles.name()}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t.hr.roles.namePlaceholder()}
              className="
                border-border/40 bg-background/50
                focus:bg-background
                h-11 rounded-xl transition-all
              "
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-destructive text-xs font-medium"
              >
                {String(errors.name.message)}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="slug"
              className="
                text-foreground flex items-center gap-1.5 font-semibold
              "
            >
              {t.hr.roles.slug()}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="slug"
                {...register('slug')}
                placeholder={t.hr.roles.slugPlaceholder()}
                disabled={isEditing}
                className="
                  border-border/40 bg-background/50
                  focus:bg-background
                  h-11 rounded-xl pl-4 font-mono transition-all
                "
                aria-invalid={!!errors.slug}
              />
              {isEditing && (
                <LockIcon className="
                  text-muted-foreground/50 absolute top-1/2 right-3 h-4 w-4
                  -translate-y-1/2
                "
                />
              )}
            </div>
            {errors.slug && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-destructive text-xs font-medium"
              >
                {String(errors.slug.message)}
              </motion.p>
            )}
            {!isEditing && (
              <p className="
                text-muted-foreground bg-muted/30 inline-block rounded-lg p-1.5
                text-[10px]
              "
              >
                {t.hr.roles.slugHelp()}
              </p>
            )}
          </div>

          <div className="
            space-y-2
            md:col-span-2
          "
          >
            <Label
              htmlFor="description"
              className="text-foreground font-semibold"
            >
              {t.hr.roles.description()}
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t.hr.roles.descriptionPlaceholder()}
              className="
                border-border/40 bg-background/50
                focus:bg-background
                min-h-[100px] resize-none rounded-xl transition-all
              "
              rows={3}
            />
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
            <IconKey className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-semibold">{t.hr.roles.permissions()}</h2>
        </div>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          {t.hr.roles.permissionsDescription()}
        </p>
        <PermissionsMatrix
          value={permissions}
          onChange={newPermissions => setValue('permissions', newPermissions)}
        />
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
