import type { UseFormReturn } from 'react-hook-form'
import type { UserFormData } from '@/schemas/user'
import { IconCamera, IconInfoCircle, IconMail } from '@tabler/icons-react'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { PhoneInput } from '@workspace/ui/components/phone-number'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { AnimatePresence, motion } from 'motion/react'
import { Controller } from 'react-hook-form'
import { useTranslations } from '@/i18n'

interface UserBasicInfoSectionProps {
  form: UseFormReturn<UserFormData>
  isEditing: boolean
}

export function UserBasicInfoSection({ form, isEditing }: UserBasicInfoSectionProps) {
  const t = useTranslations()
  const { register, control, watch, setValue, formState: { errors } } = form

  return (
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
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                {...field}
                defaultCountry="CI"
                placeholder={t.hr.users.phonePlaceholder()}
                className="rounded-xl border-border/40 bg-background/50 focus:bg-background transition-all"
              />
            )}
          />
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
              <SelectValue placeholder={t.hr.common.status()}>
                {watch('status') === 'active' && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    {t.hr.status.active()}
                  </div>
                )}
                {watch('status') === 'inactive' && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-muted" />
                    {t.hr.status.inactive()}
                  </div>
                )}
                {watch('status') === 'suspended' && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    {t.hr.status.suspended()}
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
  )
}
