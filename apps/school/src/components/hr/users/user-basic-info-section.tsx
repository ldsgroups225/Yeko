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
        <h2 className="font-serif text-xl font-semibold">{t.hr.users.basicInfo()}</h2>
      </div>

      <div className="
        grid gap-6
        md:grid-cols-2
      "
      >
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-foreground flex items-center gap-1.5 font-semibold"
          >
            {t.hr.common.name()}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder={t.hr.users.namePlaceholder()}
            className="
              border-border/40 bg-background/50
              focus:bg-background
              h-11 rounded-xl transition-all
            "
            aria-invalid={!!errors.name}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-destructive text-xs font-medium"
              >
                {errors.name.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-foreground flex items-center gap-1.5 font-semibold"
          >
            {t.hr.common.email()}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <IconMail className="
              text-muted-foreground absolute top-1/2 left-3 h-4 w-4
              -translate-y-1/2
            "
            />
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder={t.hr.users.emailPlaceholder()}
              className="
                border-border/40 bg-background/50
                focus:bg-background
                h-11 rounded-xl pl-10 transition-all
              "
              aria-invalid={!!errors.email}
              disabled={isEditing}
            />
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-destructive text-xs font-medium"
              >
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
          {!isEditing && (
            <p className="text-muted-foreground ml-1 text-[11px] font-medium">
              {t.hr.users.emailUniqueHint()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground font-semibold">{t.hr.common.phone()}</Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                {...field}
                defaultCountry="CI"
                placeholder={t.hr.users.phonePlaceholder()}
                className="
                  border-border/40 bg-background/50
                  focus:bg-background
                  rounded-xl transition-all
                "
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="status"
            className="text-foreground flex items-center gap-1.5 font-semibold"
          >
            {t.hr.common.status()}
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch('status') || ''}
            onValueChange={value => setValue('status', value as 'active' | 'inactive' | 'suspended')}
          >
            <SelectTrigger className="
              border-border/40 bg-background/50
              focus:bg-background
              h-11 rounded-xl transition-all
            "
            >
              <SelectValue placeholder={t.hr.common.status()}>
                {watch('status') === 'active' && (
                  <div className="flex items-center gap-2">
                    <div className="bg-success h-2 w-2 rounded-full" />
                    {t.hr.status.active()}
                  </div>
                )}
                {watch('status') === 'inactive' && (
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-2 w-2 rounded-full" />
                    {t.hr.status.inactive()}
                  </div>
                )}
                {watch('status') === 'suspended' && (
                  <div className="flex items-center gap-2">
                    <div className="bg-destructive h-2 w-2 rounded-full" />
                    {t.hr.status.suspended()}
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
                  <div className="bg-destructive h-2 w-2 rounded-full" />
                  {t.hr.status.suspended()}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <AnimatePresence>
            {errors.status && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-destructive text-xs font-medium"
              >
                {errors.status.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="
          space-y-2
          md:col-span-2
        "
        >
          <Label htmlFor="avatarUrl" className="text-foreground font-semibold">{t.hr.common.avatar()}</Label>
          <div className="relative">
            <IconCamera className="
              text-muted-foreground absolute top-1/2 left-3 h-4 w-4
              -translate-y-1/2
            "
            />
            <Input
              id="avatarUrl"
              type="url"
              {...register('avatarUrl')}
              placeholder={t.hr.users.avatarPlaceholder()}
              className="
                border-border/40 bg-background/50
                focus:bg-background
                h-11 rounded-xl pl-10 transition-all
              "
            />
          </div>
          <AnimatePresence>
            {errors.avatarUrl && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-destructive text-xs font-medium"
              >
                {errors.avatarUrl.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
