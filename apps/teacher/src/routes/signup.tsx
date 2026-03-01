import { IconLoader2 } from '@tabler/icons-react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { useState } from 'react'
import { toast } from 'sonner'
import { useI18nContext } from '@/i18n/i18n-react'
import { signUp } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setIsLoading(true)

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        toast.error(result.error.message || 'Erreur lors de l\'inscription')
        return
      }

      toast.success('Compte créé avec succès !')
      navigate({ to: '/app' })
    }
    catch {
      toast.error('Une erreur est survenue lors de l\'inscription')
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="
      flex min-h-screen flex-col items-center justify-center px-4 py-8
    "
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <img
            src="/icon.png"
            alt="Yeko Logo"
            className="h-24 w-24 rounded-lg object-contain"
          />
          <h1 className="text-2xl font-bold">{LL.app.name()}</h1>
          <p className="text-muted-foreground">Créer un compte enseignant</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Prénom et nom"
              required
              autoComplete="name"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{LL.auth.email()}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={LL.auth.emailPlaceholder()}
              required
              autoComplete="email"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{LL.auth.password()}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mot de passe (min. 8 caractères)"
              required
              autoComplete="new-password"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
              required
              autoComplete="new-password"
              className="h-12"
            />
          </div>

          <Button
            type="submit"
            className={cn('touch-target h-12 w-full')}
            disabled={isLoading}
          >
            {isLoading
              ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                )
              : (
                  'Créer mon compte'
                )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">{LL.auth.or()}</span>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Déjà un compte ?
            {' '}
            <Link
              to="/login"
              className="
                text-primary
                hover:underline
              "
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
