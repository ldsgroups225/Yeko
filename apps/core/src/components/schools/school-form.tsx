import type { CreateSchoolInput, SchoolStatus } from '@/schemas/school'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceFloppy, IconLoader2, IconSchool } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { getPresignedUploadUrl } from '@/core/functions/storage'
import { useI18nContext } from '@/i18n/i18n-react'
import { storageConfigQueryOptions } from '@/integrations/tanstack-query/storage-options'
import { CreateSchoolSchema } from '@/schemas/school'

interface SchoolFormProps {
  defaultValues?: Partial<CreateSchoolInput>
  onSubmit: (data: CreateSchoolInput) => Promise<void>
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
  onCancel: () => void
}

export function SchoolForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
  onCancel,
}: SchoolFormProps) {
  'use no memo'

  const { LL } = useI18nContext()

  const { data: storageConfigured = null } = useQuery(storageConfigQueryOptions())

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    resolver: zodResolver(CreateSchoolSchema),
    values: {
      name: defaultValues?.name || '',
      code: defaultValues?.code || '',
      address: defaultValues?.address || '',
      phone: defaultValues?.phone || '',
      email: defaultValues?.email || '',
      logoUrl: defaultValues?.logoUrl || '',
      status: defaultValues?.status || 'active',
      settings: defaultValues?.settings || {},
    },
    defaultValues: {
      name: defaultValues?.name || '',
      code: defaultValues?.code || '',
      address: defaultValues?.address || '',
      phone: defaultValues?.phone || '',
      email: defaultValues?.email || '',
      logoUrl: defaultValues?.logoUrl || '',
      status: defaultValues?.status || 'active',
      settings: defaultValues?.settings || {},
    },
  })

  const { register, handleSubmit, setValue, control } = form
  const { errors } = form.formState
  const status = useWatch({ control, name: 'status' })
  const logoUrl = useWatch({ control, name: 'logoUrl' })

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file)
      return

    setUploadError(null)
    setIsUploading(true)

    try {
      // Get presigned URL from server
      const result = await getPresignedUploadUrl({
        data: {
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
          folder: 'logos',
        },
      })

      if (!result.success) {
        setUploadError(result.error)
        setIsUploading(false)
        return
      }

      // Upload file directly to R2
      const uploadResponse = await fetch(result.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        setUploadError(LL.schools.uploadError())
        setIsUploading(false)
        return
      }

      // Set the public URL in the form
      setValue('logoUrl', result.publicUrl)
      setIsUploading(false)
    }
    catch (error) {
      console.error('Upload error:', error)
      setUploadError(LL.schools.uploadError())
      setIsUploading(false)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="
        grid gap-6
        md:grid-cols-2
      "
      >
        {/* Basic Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSchool className="h-5 w-5" />
              {LL.schools.basicInfo()}
            </CardTitle>
            <CardDescription>
              {LL.schools.basicInfoDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="
              grid gap-4
              md:grid-cols-2
            "
            >
              <div className="space-y-2">
                <Label htmlFor="name">
                  {LL.schools.name()}
                  {' '}
                  *
                </Label>
                <Input
                  id="name"
                  placeholder={LL.schools.namePlaceholder()}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-destructive text-sm">{errors.name.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">
                  {LL.schools.code()}
                  {' '}
                  *
                </Label>
                <Input
                  id="code"
                  placeholder={LL.schools.codePlaceholder()}
                  {...register('code')}
                />
                {errors.code && (
                  <p className="text-destructive text-sm">{errors.code.message as string}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{LL.schools.address()}</Label>
              <Input
                id="address"
                placeholder={LL.schools.addressPlaceholder()}
                {...register('address')}
              />
              {errors.address && (
                <p className="text-destructive text-sm">{errors.address.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{LL.schools.phone()}</Label>
              <Input
                id="phone"
                placeholder={LL.schools.phonePlaceholder()}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-destructive text-sm">{errors.phone.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{LL.schools.email()}</Label>
              <Input
                id="email"
                type="email"
                placeholder={LL.schools.emailPlaceholder()}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">{LL.schools.logo()}</Label>
              <div className="flex items-start gap-4">
                {/* Logo preview */}
                <div className="shrink-0">
                  {logoUrl
                    ? (
                        <div className="
                          relative h-24 w-24 overflow-hidden rounded-lg border-2
                          border-dashed
                        "
                        >
                          <img
                            src={logoUrl}
                            alt={LL.schools.logoPreview()}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setValue('logoUrl', '')}
                            className="
                              bg-destructive text-destructive-foreground
                              hover:bg-destructive/90
                              absolute top-1 right-1 rounded-full p-1
                            "
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )
                    : (
                        <div className="
                          bg-muted flex h-24 w-24 items-center justify-center
                          rounded-lg border-2 border-dashed
                        "
                        >
                          <IconSchool className="text-muted-foreground h-8 w-8" />
                        </div>
                      )}
                </div>

                {/* Upload options */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="logoFile"
                      className="text-muted-foreground text-sm"
                    >
                      {LL.schools.uploadFile()}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        ref={fileInputRef}
                        id="logoFile"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        disabled={storageConfigured === false || isUploading}
                        onChange={handleFileSelect}
                        className={storageConfigured === false
                          ? `cursor-not-allowed opacity-50`
                          : ''}
                      />
                      {isUploading && (
                        <div className="
                          text-muted-foreground flex items-center gap-2 text-sm
                        "
                        >
                          <IconLoader2 className="h-4 w-4 animate-spin" />
                          <span>{LL.schools.uploading()}</span>
                        </div>
                      )}
                    </div>
                    {storageConfigured === false && (
                      <p className="text-muted-foreground text-xs">
                        {LL.schools.storageNotConfigured()}
                      </p>
                    )}
                    {storageConfigured === null && (
                      <p className="text-muted-foreground text-xs">
                        {LL.schools.checkingConfiguration()}
                      </p>
                    )}
                    {uploadError && (
                      <p className="text-destructive text-xs">{uploadError}</p>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="
                      relative flex justify-center text-xs uppercase
                    "
                    >
                      <span className="bg-background text-muted-foreground px-2">{LL.schools.or()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="logoUrl"
                      className="text-muted-foreground text-sm"
                    >
                      {LL.schools.logoUrl()}
                    </Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      placeholder={LL.schools.logoUrlPlaceholder()}
                      {...register('logoUrl')}
                    />
                  </div>
                </div>
              </div>
              {errors.logoUrl && (
                <p className="text-destructive text-sm">{errors.logoUrl.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{LL.schools.status()}</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (value)
                    setValue('status', value as SchoolStatus)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={LL.schools.selectStatus()}>
                    {status === 'active' && LL.status.active()}
                    {status === 'inactive' && LL.status.inactive()}
                    {status === 'suspended' && LL.status.suspended()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{LL.status.active()}</SelectItem>
                  <SelectItem value="inactive">{LL.status.inactive()}</SelectItem>
                  <SelectItem value="suspended">{LL.status.suspended()}</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-destructive text-sm">{errors.status.message as string}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          {LL.common.cancel()}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="gap-2"
        >
          {isSubmitting
            ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  {mode === 'create' ? LL.schools.creating() : LL.schools.saving()}
                </>
              )
            : (
                <>
                  <IconDeviceFloppy className="h-4 w-4" />
                  {mode === 'create' ? LL.schools.createSchool() : LL.schools.saveChanges()}
                </>
              )}
        </Button>
      </div>
    </form>
  )
}
