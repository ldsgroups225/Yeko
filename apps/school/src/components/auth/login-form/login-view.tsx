import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2 } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Separator } from '@workspace/ui/components/separator'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { authClient } from '@/lib/auth-client'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginViewProps {
  onForgotPassword: () => void
  containerVariants: any
  itemVariants: any
}

export function LoginView({ onForgotPassword, containerVariants, itemVariants }: LoginViewProps) {
  const t = useTranslations()
  const [isPending, setIsPending] = useState(false)
  const [isGooglePending, setIsGooglePending] = useState(false)

  const appName = t?.app?.name?.() || 'Yeko School'

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsPending(true)
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: '/dashboard',
      })

      if (result.error) {
        toast.error(
          result.error.message
          || t?.auth?.login?.error?.()
          || 'Erreur de connexion',
        )
      }
      else {
        toast.success(t?.auth?.login?.success?.() || 'Connexion réussie')
      }
    }
    catch {
      toast.error(t?.auth?.login?.error?.() || 'Erreur de connexion')
    }
    finally {
      setIsPending(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGooglePending(true)
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      })
    }
    catch {
      toast.error(
        t?.auth?.login?.googleError?.()
        || 'Erreur lors de la connexion avec Google',
      )
      setIsGooglePending(false)
    }
  }

  return (
    <motion.div
      key="login"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Mobile Logo */}
      <motion.div
        variants={itemVariants}
        className="lg:hidden text-center mb-8"
      >
        <div className="inline-flex items-center gap-3">
          <img
            src="/icon.png"
            alt="Yeko logo"
            className="size-12 rounded-xl object-contain shadow-lg"
          />
          <div className="flex flex-col text-left">
            <span className="text-xl font-black tracking-tighter uppercase font-outfit">
              {appName}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Administration
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t.auth.login.title()}
        </h2>
        <p className="text-muted-foreground">
          {t.auth.login.subtitle()}
        </p>
      </motion.div>

      {/* Google OAuth */}
      <motion.div variants={itemVariants}>
        <Button
          onClick={handleGoogleSignIn}
          disabled={isGooglePending || isPending}
          className="w-full h-12 text-base"
          variant="outline"
          type="button"
        >
          {isGooglePending
            ? (
                <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
              )
            : (
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
          {t.auth.login.continueWithGoogle()}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">
            {t.auth.login.orContinueWith()}
          </span>
        </div>
      </motion.div>

      {/* Login Form */}
      <motion.form
        onSubmit={loginForm.handleSubmit(onLoginSubmit)}
        className="space-y-4"
        variants={itemVariants}
      >
        <div className="space-y-2">
          <Label htmlFor="email">{t.auth.login.email()}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t.auth.login.emailPlaceholder()}
            disabled={isPending || isGooglePending}
            className="h-12"
            {...loginForm.register('email')}
          />
          {loginForm.formState.errors.email && (
            <p className="text-sm text-destructive">
              {loginForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.auth.login.password()}</Label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {t.auth.login.forgotPassword()}
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder={t.auth.login.passwordPlaceholder()}
            disabled={isPending || isGooglePending}
            className="h-12"
            {...loginForm.register('password')}
          />
          {loginForm.formState.errors.password && (
            <p className="text-sm text-destructive">
              {loginForm.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={isPending || isGooglePending}
        >
          {isPending
            ? (
                <>
                  <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t.auth.login.submitting()}
                </>
              )
            : (
                t.auth.login.submit()
              )}
        </Button>
      </motion.form>
    </motion.div>
  )
}
