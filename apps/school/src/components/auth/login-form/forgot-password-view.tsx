import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { authClient } from '@/lib/auth-client'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordViewProps {
  onBackToLogin: () => void
  onEmailSent: (email: string) => void
  containerVariants: any
  itemVariants: any
}

export function ForgotPasswordView({
  onBackToLogin,
  onEmailSent,
  containerVariants,
  itemVariants,
}: ForgotPasswordViewProps) {
  const t = useTranslations()
  const [isPending, setIsPending] = useState(false)

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onForgotSubmit = async (data: ForgotPasswordFormData) => {
    setIsPending(true)
    try {
      await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: '/reset-password',
      })
      onEmailSent(data.email)
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

  return (
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
          onClick={onBackToLogin}
          className="
            text-muted-foreground
            hover:text-foreground
            mb-6 inline-flex items-center gap-2 text-sm transition-colors
          "
        >
          <IconArrowLeft className="size-4" />
          {t.auth.forgotPassword.backToLogin()}
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <h2 className="
          text-2xl font-bold tracking-tight
          sm:text-3xl
        "
        >
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
            <p className="text-destructive text-sm">
              {forgotForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-12 w-full text-base"
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
  )
}
