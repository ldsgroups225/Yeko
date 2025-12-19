import type { UpdateSchoolProfileInput } from '@/schemas/school-profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  const { t } = useTranslation()

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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={school.logoUrl ?? undefined} alt={school.name} />
          <AvatarFallback>
            <Building2 className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Label htmlFor="logo">{t('settings.profile.logo')}</Label>
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
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('settings.profile.uploadLogo')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('settings.profile.logoHint')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('settings.profile.schoolName')}</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder={t('settings.profile.schoolNamePlaceholder')}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">{t('settings.profile.schoolCode')}</Label>
          <Input id="code" value={school.code} disabled />
          <p className="text-xs text-muted-foreground">
            {t('settings.profile.schoolCodeHint')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">{t('settings.profile.address')}</Label>
          <Textarea
            id="address"
            {...form.register('address')}
            placeholder={t('settings.profile.addressPlaceholder')}
            rows={2}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">{t('settings.profile.phone')}</Label>
            <Input
              id="phone"
              {...form.register('phone')}
              placeholder="+225 01 02 03 04 05"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('settings.profile.email')}</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="contact@ecole.ci"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  )
}
