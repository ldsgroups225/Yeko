import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconCheck,
  IconCopy,
  IconLoader2,
  IconUserPlus,
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createSchoolAdmin } from '@/core/functions/create-school-admin'

const createAdminSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.email('Email invalide'),
})

type CreateAdminFormData = z.infer<typeof createAdminSchema>

interface CreateAdminDialogProps {
  schoolId: string
  schoolName: string
}

export function CreateAdminDialog({
  schoolId,
  schoolName,
}: CreateAdminDialogProps) {
  const [open, setOpen] = useState(false)
  const [credentials, setCredentials] = useState<{
    email: string
    password: string
  } | null>(null)
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(
    null,
  )
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  })

  const handleClose = () => {
    setOpen(false)
    setCredentials(null)
    reset()
  }

  const createAdminMutation = useMutation({
    mutationFn: async (data: CreateAdminFormData) => {
      return createSchoolAdmin({
        data: {
          schoolId,
          email: data.email,
          name: data.name,
        },
      })
    },
    onSuccess: (result) => {
      toast.success('Compte administrateur créé avec succès')

      // Show credentials if in development
      if (result.password) {
        setCredentials({
          email: result.user.email,
          password: result.password,
        })
      }
      else {
        // In production, just close the dialog
        handleClose()
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['school', schoolId] })
      queryClient.invalidateQueries({ queryKey: ['schoolUsers'] })
    },
    onError: () => {
      toast.error('Erreur lors de la création du compte')
    },
  })

  const onSubmit = (data: CreateAdminFormData) => {
    createAdminMutation.mutate(data)
  }

  const copyToClipboard = async (text: string, field: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success(`${field === 'email' ? 'Email' : 'Mot de passe'} copié`)
      setTimeout(() => setCopiedField(null), 2000)
    }
    catch {
      toast.error('Erreur lors de la copie')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(
          <button
            type="button"
            className={buttonVariants({ className: 'gap-2' })}
          >
            <IconUserPlus className="h-4 w-4" />
            Créer un administrateur
          </button>
        )}
      />
      <DialogContent className="sm:max-w-[500px]">
        {!credentials
          ? (
              <>
                <DialogHeader>
                  <DialogTitle>Créer un compte administrateur</DialogTitle>
                  <DialogDescription>
                    Créer un nouveau compte administrateur pour l'école "
                    {schoolName}
                    ". Un mot de passe aléatoire sera généré.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      placeholder="Jean Dupont"
                      disabled={createAdminMutation.isPending}
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@ecole.com"
                      disabled={createAdminMutation.isPending}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <Alert>
                    <AlertDescription className="text-sm">
                      Un mot de passe aléatoire sera généré et affiché après la
                      création.
                      {!import.meta.env.DEV
                        && ' Un email sera envoyé à l\'utilisateur.'}
                    </AlertDescription>
                  </Alert>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={createAdminMutation.isPending}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={createAdminMutation.isPending}>
                      {createAdminMutation.isPending
                        ? (
                            <>
                              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                              Création...
                            </>
                          )
                        : (
                            'Créer le compte'
                          )}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            )
          : (
              <>
                <DialogHeader>
                  <DialogTitle>Compte créé avec succès !</DialogTitle>
                  <DialogDescription>
                    Voici les identifiants de connexion. Copiez-les et partagez-les
                    avec l'administrateur.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <Alert className="bg-success/10 border-success/20">
                    <AlertDescription>
                      ✅ Le compte administrateur a été créé avec succès.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="flex gap-2">
                        <Input
                          value={credentials.email}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            copyToClipboard(credentials.email, 'email')}
                        >
                          {copiedField === 'email'
                            ? (
                                <IconCheck className="h-4 w-4 text-success" />
                              )
                            : (
                                <IconCopy className="h-4 w-4" />
                              )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Mot de passe</Label>
                      <div className="flex gap-2">
                        <Input
                          value={credentials.password}
                          readOnly
                          className="font-mono text-sm"
                          type="text"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            copyToClipboard(credentials.password, 'password')}
                        >
                          {copiedField === 'password'
                            ? (
                                <IconCheck className="h-4 w-4 text-success" />
                              )
                            : (
                                <IconCopy className="h-4 w-4" />
                              )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Alert variant="destructive">
                    <AlertDescription className="text-sm">
                      ⚠️ Attention : Ces identifiants ne seront plus affichés.
                      Assurez-vous de les copier maintenant.
                    </AlertDescription>
                  </Alert>
                </div>

                <DialogFooter>
                  <Button onClick={handleClose} className="w-full">
                    Fermer
                  </Button>
                </DialogFooter>
              </>
            )}
      </DialogContent>
    </Dialog>
  )
}
