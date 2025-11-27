import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, School } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateSchoolSchema } from '@/schemas/school'

interface SchoolFormProps {
  defaultValues?: any
  onSubmit: (data: any) => Promise<void>
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

  const form = useForm({
    resolver: zodResolver(CreateSchoolSchema),
    defaultValues: defaultValues || {
      status: 'active',
      settings: {},
    },
  })

  const { register, handleSubmit, setValue, reset, control } = form
  const { errors } = form.formState
  const status = useWatch({ control, name: 'status' })
  const logoUrl = useWatch({ control, name: 'logoUrl' })

  // Reset form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
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
                          <School className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                </div>

                {/* Upload options */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="logoFile" className="text-sm text-muted-foreground">
                      Télécharger un fichier
                    </Label>
                    <Input
                      id="logoFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // Validate file size (max 2MB)
                          if (file.size > 2 * 1024 * 1024) {
                            console.error('Le fichier est trop volumineux. Taille maximale: 2MB')
                            return
                          }
                          // Convert to base64
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setValue('logoUrl', reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="cursor-pointer"
                    />
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
                onValueChange={(value: 'active' | 'inactive' | 'suspended') => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le statut" />
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
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting
            ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Création en cours...' : 'Enregistrement...'}
                </>
              )
            : (
                <>
                  <Save className="h-4 w-4" />
                  {mode === 'create' ? 'Créer l\'École' : 'Enregistrer les modifications'}
                </>
              )}
        </Button>
      </div>
    </form>
  )
}
