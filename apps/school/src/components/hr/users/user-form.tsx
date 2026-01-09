import type { UserFormData } from '@/schemas/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconCamera, IconDeviceFloppy, IconInfoCircle, IconLoader2, IconMail, IconPhone, IconShield, IconUserPlus } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { AnimatePresence, motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { RoleSelector } from '@/components/hr/users/role-selector'
import { useTranslations } from '@/i18n'
import { userCreateSchema } from '@/schemas/user'
import { createNewUser, updateExistingUser } from '@/school/functions/users'

interface UserFormProps {
  user?: UserFormData & { id: string }
  onSuccess?: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const isEditing = !!user

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
          name: '',
          email: '',
          phone: '',
          avatarUrl: '',
          status: 'active',
          roleIds: [],
        },
  })

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return await createNewUser({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(t.hr.users.createSuccess())
      onSuccess?.()
    },
    onError: (error: Error) => {
      const errorMessage = error.message || t.errors.generic()
      if (errorMessage.includes('Email already exists')) {
        toast.error(t.hr.users.emailAlreadyExists())
      }
      else {
        toast.error(errorMessage)
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return await updateExistingUser({
        data: {
          userId: user!.id,
          data,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', user!.id] })
      toast.success(t.hr.users.updateSuccess())
      onSuccess?.()
    },
    onError: (error: Error) => {
      const errorMessage = error.message || t.errors.generic()
      if (errorMessage.includes('Email already exists')) {
        toast.error(t.hr.users.emailAlreadyExists())
      }
      else {
        toast.error(errorMessage)
      }
    },
  })

  const onSubmit = (data: UserFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    }
    else {
      createMutation.mutate(data)
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
          <h2 className="text-xl font-serif font-semibold">{t.hr.users.basicInfo()}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1.5 font-semibold text-foreground">
              {t.hr.common.name()}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t.hr.users.namePlaceholder()}
              className="rounded-xl h-11 border-border/40 bg-background/50 focus:bg-background transition-all"
              aria-invalid={!!errors.name}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs font-medium text-destructive">{errors.name.message}</motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5 font-semibold text-foreground">
              {t.hr.common.email()}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <IconMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={t.hr.users.emailPlaceholder()}
                className="pl-10 rounded-xl h-11 border-border/40 bg-background/50 focus:bg-background transition-all"
                aria-invalid={!!errors.email}
                disabled={isEditing}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs font-medium text-destructive">{errors.email.message}</motion.p>
              )}
            </AnimatePresence>
            {!isEditing && (
              <p className="text-[11px] font-medium text-muted-foreground ml-1">
                {t.hr.users.emailUniqueHint()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="font-semibold text-foreground">{t.hr.common.phone()}</Label>
            <div className="relative">
              <IconPhone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder={t.hr.users.phonePlaceholder()}
                className="pl-10 rounded-xl h-11 border-border/40 bg-background/50 focus:bg-background transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="flex items-center gap-1.5 font-semibold text-foreground">
              {t.hr.common.status()}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('status') || ''}
              onValueChange={value => setValue('status', value as 'active' | 'inactive' | 'suspended')}
            >
              <SelectTrigger className="rounded-xl h-11 border-border/40 bg-background/50 focus:bg-background transition-all">
                <SelectValue />
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
                <SelectItem value="suspended" className="rounded-lg py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    {t.hr.status.suspended()}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <AnimatePresence>
              {errors.status && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs font-medium text-destructive">{errors.status.message}</motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="avatarUrl" className="font-semibold text-foreground">{t.hr.common.avatar()}</Label>
            <div className="relative">
              <IconCamera className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="avatarUrl"
                type="url"
                {...register('avatarUrl')}
                placeholder={t.hr.users.avatarPlaceholder()}
                className="pl-10 rounded-xl h-11 border-border/40 bg-background/50 focus:bg-background transition-all"
              />
            </div>
            <AnimatePresence>
              {errors.avatarUrl && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs font-medium text-destructive">{errors.avatarUrl.message}</motion.p>
              )}
            </AnimatePresence>
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
            <IconShield className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-serif font-semibold">{t.hr.users.roleAssignment()}</h2>
        </div>
        <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
          {t.hr.users.roleAssignmentDescription()}
        </p>
        <div className="space-y-4">
          <Label className="flex items-center gap-1.5 font-semibold text-foreground">
            {t.hr.common.roles()}
            <span className="text-destructive">*</span>
          </Label>
          <RoleSelector
            selectedRoleIds={watch('roleIds') || []}
            onChange={roleIds => setValue('roleIds', roleIds, { shouldValidate: true })}
            disabled={isLoading}
          />
          <AnimatePresence>
            {errors.roleIds && (
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs font-medium text-destructive">{errors.roleIds.message}</motion.p>
            )}
          </AnimatePresence>
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
                  <IconDeviceFloppy className="mr-2 h-4 w-4" />
                )
              : (
                  <IconUserPlus className="mr-2 h-4 w-4" />
                )}
          {isEditing ? t.common.save() : t.common.create()}
        </Button>
      </div>
    </form>
  )
}
