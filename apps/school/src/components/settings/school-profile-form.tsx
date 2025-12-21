import type { UpdateSchoolProfileInput } from '@/schemas/school-profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from '@/i18n'
import {
  updateSchoolProfileSchema,
} from '@/schemas/school-profile'

interface SchoolProfileFormProps {
  school: {
    id: string
    name: string
    code: string
    address: string | null
    phone: string | null
    email: string | null
    logoUrl: string | null
  }
  onSubmit: (data: UpdateSchoolProfileInput) => void
  onLogoUpdate: (logoUrl: string) => void
  isSubmitting: boolean
}

export function SchoolProfileForm({
  school,
  onSubmit,
  isSubmitting,
}: SchoolProfileFormProps) {
  const t = useTranslations()

  const form = useForm<UpdateSchoolProfileInput>({
    resolver: zodResolver(updateSchoolProfileSchema),
    defaultValues: {
      name: school.name,
      address: school.address ?? '',
      phone: school.phone ?? '',
      email: school.email ?? '',
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return

    // For now, we'll use a placeholder - in production, upload to R2/S3
    // This would be replaced with actual file upload logic
    const reader = new FileReader()
    reader.onloadend = () => {
      // In production: upload to storage and get URL
      // onLogoUpdate(uploadedUrl)
    }
    reader.readAsDataURL(file)
  }

  const inputClass = 'rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors'

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center gap-6 p-4 rounded-2xl bg-muted/10 border border-border/40">
        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
          <AvatarImage src={school.logoUrl ?? undefined} alt={school.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <Building2 className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="logo" className="text-sm font-semibold text-foreground">{t.settings.profile.logo()}</Label>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              {t.settings.profile.logoHint()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="logo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('logo')?.click()}
              className="rounded-xl border-border/40 shadow-sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t.settings.profile.uploadLogo()}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.settings.profile.schoolName()}</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder={t.settings.profile.schoolNamePlaceholder()}
            className={inputClass}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive font-medium">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.settings.profile.schoolCode()}</Label>
          <Input id="code" value={school.code} disabled className={`${inputClass} opacity-70 bg-muted/40 font-mono`} />
          <p className="text-xs text-muted-foreground/70">
            {t.settings.profile.schoolCodeHint()}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.settings.profile.address()}</Label>
          <Textarea
            id="address"
            {...form.register('address')}
            placeholder={t.settings.profile.addressPlaceholder()}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.settings.profile.phone()}</Label>
            <Input
              id="phone"
              {...form.register('phone')}
              placeholder="+225 01 02 03 04 05"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.settings.profile.email()}</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder={t.placeholders.schoolEmail()}
              className={inputClass}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive font-medium">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting} className="rounded-xl shadow-lg shadow-primary/20 px-8">
          {isSubmitting ? t.common.saving() : t.common.save()}
        </Button>
      </div>
    </form>
  )
}
