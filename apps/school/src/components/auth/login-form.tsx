import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowLeft, IconLoader2, IconMail } from '@tabler/icons-react'
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

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

type LoginFormData = z.infer<typeof loginSchema>
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

type AuthView = 'login' | 'forgot-password' | 'email-sent'

export function LoginForm() {
  const t = useTranslations()
  const [isPending, setIsPending] = useState(false)
  const [isGooglePending, setIsGooglePending] = useState(false)
  const [view, setView] = useState<AuthView>('login')
  const [sentEmail, setSentEmail] = useState('')

  // Safety check for translations
  const appName = t?.app?.name?.() || 'Yeko School'
  const tagline = t?.app?.tagline?.() || 'Gestion scolaire intelligente'

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
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

  const onForgotSubmit = async (data: ForgotPasswordFormData) => {
    setIsPending(true)
    try {
      await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: '/reset-password',
      })
      setSentEmail(data.email)
      setView('email-sent')
    }
    catch {
      toast.error(
        t?.auth?.forgotPassword?.error?.()
        || 'Erreur lors de la réinitialisation du mot de passe',
      )
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="size-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <span className="text-2xl font-bold text-white">Y</span>
              </div>
              <span className="text-2xl font-bold text-white">{appName}</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
              {tagline}
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              {t.auth.login.brandDescription()}
            </p>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            className="absolute bottom-12 left-12 xl:left-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center gap-4 text-white/60 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="size-8 rounded-full bg-white/20 border-2 border-white/30"
                  />
                ))}
              </div>
              <span>{t.auth.login.trustedBy()}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {view === 'login' && (
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
                <div className="inline-flex items-center gap-2">
                  <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">
                      Y
                    </span>
                  </div>
                  <span className="text-xl font-bold">{appName}</span>
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
                      onClick={() => setView('forgot-password')}
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
          )}

          {view === 'forgot-password' && (
            <motion.div
              key="forgot"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                  <IconArrowLeft className="size-4" />
                  {t.auth.forgotPassword.backToLogin()}
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {t.auth.forgotPassword.title()}
                </h2>
                <p className="text-muted-foreground">
                  {t.auth.forgotPassword.subtitle()}
                </p>
              </motion.div>

              <motion.form
                onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
                className="space-y-4"
                variants={itemVariants}
              >
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">{t.auth.login.email()}</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder={t.auth.login.emailPlaceholder()}
                    disabled={isPending}
                    className="h-12"
                    {...forgotForm.register('email')}
                  />
                  {forgotForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {forgotForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={isPending}
                >
                  {isPending
                    ? (
                        <>
                          <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t.auth.forgotPassword.submitting()}
                        </>
                      )
                    : (
                        t.auth.forgotPassword.submit()
                      )}
                </Button>
              </motion.form>
            </motion.div>
          )}

          {view === 'email-sent' && (
            <motion.div
              key="sent"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 text-center"
            >
              <motion.div
                variants={itemVariants}
                className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <IconMail className="size-8 text-primary" />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {t.auth.forgotPassword.emailSentTitle()}
                </h2>
                <p className="text-muted-foreground">
                  {t.auth.forgotPassword.emailSentDescription({
                    email: sentEmail,
                  })}
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => setView('login')}
                >
                  {t.auth.forgotPassword.backToLogin()}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {t.auth.forgotPassword.noEmail()}
                  {' '}
                  <button
                    type="button"
                    onClick={() => setView('forgot-password')}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {t.auth.forgotPassword.tryAgain()}
                  </button>
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
