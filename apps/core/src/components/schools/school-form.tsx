import type { CreateSchoolInput, SchoolStatus } from '@/schemas/school'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceFloppy, IconLoader2, IconSchool } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { checkStorageConfigured, getPresignedUploadUrl } from '@/core/functions/storage'
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

  const [storageConfigured, setStorageConfigured] = useState<boolean | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    resolver: zodResolver(CreateSchoolSchema),
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

  const { register, handleSubmit, setValue, reset, control } = form
  const { errors } = form.formState
  const status = useWatch({ control, name: 'status' })
  const logoUrl = useWatch({ control, name: 'logoUrl' })

  // Check if R2 storage is configured on mount
  useEffect(() => {
    checkStorageConfigured().then((result) => {
      setStorageConfigured(result.configured)
    }).catch(() => {
      setStorageConfigured(false)
    })
  }, [])

  // Reset form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

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
        setUploadError('Erreur lors du téléversement du fichier.')
        setIsUploading(false)
        return
      }

      // Set the public URL in the form
      setValue('logoUrl', result.publicUrl)
      setIsUploading(false)
    }
    catch (error) {
      console.error('Upload error:', error)
      setUploadError('Erreur lors du téléversement du fichier.')
      setIsUploading(false)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSchool className="h-5 w-5" />
              Informations de Base
            </CardTitle>
            <CardDescription>
              Détails essentiels sur l'école
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'École *</Label>
                <Input
                  id="name"
                  placeholder="Entrer le nom de l'école"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code de l'École *</Label>
                <Input
                  id="code"
                  placeholder="e.g., LYCE_ST_EXUPERY"
                  {...register('code')}
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code.message as string}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                placeholder="123 Avenue de la République, Paris"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de Téléphone</Label>
              <Input
                id="phone"
                placeholder="+33 1 23 45 67 89"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@ecole.fr"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo de l'École</Label>
              <div className="flex items-start gap-4">
                {/* Logo preview */}
                <div className="shrink-0">
                  {logoUrl
                    ? (
                        <div className="relative w-24 h-24 border-2 border-dashed rounded-lg overflow-hidden">
                          <img
                            src={logoUrl}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setValue('logoUrl', '')}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )
                    : (
                        <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                          <IconSchool className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                </div>

                {/* Upload options */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="logoFile" className="text-sm text-muted-foreground">
                      Télécharger un fichier
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        ref={fileInputRef}
                        id="logoFile"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        disabled={storageConfigured === false || isUploading}
                        onChange={handleFileSelect}
                        className={storageConfigured === false ? 'cursor-not-allowed opacity-50' : ''}
                      />
                      {isUploading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <IconLoader2 className="h-4 w-4 animate-spin" />
                          <span>Téléversement...</span>
                        </div>
                      )}
                    </div>
                    {storageConfigured === false && (
                      <p className="text-xs text-muted-foreground">
                        Le téléversement de fichiers n'est pas configuré. Utilisez une URL pour l'instant.
                      </p>
                    )}
                    {storageConfigured === null && (
                      <p className="text-xs text-muted-foreground">
                        Vérification de la configuration...
                      </p>
                    )}
                    {uploadError && (
                      <p className="text-xs text-destructive">{uploadError}</p>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Ou</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="text-sm text-muted-foreground">
                      URL du logo
                    </Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      {...register('logoUrl')}
                    />
                  </div>
                </div>
              </div>
              {errors.logoUrl && (
                <p className="text-sm text-destructive">{errors.logoUrl.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (value)
                    setValue('status', value as SchoolStatus)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le statut">
                    {status === 'active' && 'Active'}
                    {status === 'inactive' && 'Inactive'}
                    {status === 'suspended' && 'Suspendue'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspendue</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message as string}</p>
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
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading} className="gap-2">
          {isSubmitting
            ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Création en cours...' : 'Enregistrement...'}
                </>
              )
            : (
                <>
                  <IconDeviceFloppy className="h-4 w-4" />
                  {mode === 'create' ? 'Créer l\'École' : 'Enregistrer les modifications'}
                </>
              )}
        </Button>
      </div>
    </form>
  )
}
