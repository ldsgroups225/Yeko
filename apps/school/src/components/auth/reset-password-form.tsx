import { zodResolver } from '@hookform/resolvers/zod'
import { IconCircleCheck, IconLoader2 } from '@tabler/icons-react'
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

const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    try {
      await authClient.resetPassword({
        newPassword: data.password,
        token,
      })
      setIsSuccess(true)
      toast.success(t.auth.resetPassword.success())
    }
    catch {
      toast.error(t.auth.resetPassword.error())
    }
    finally {
      setIsLoading(false)
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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md space-y-6 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="mx-auto size-16 rounded-full bg-green-500/10 flex items-center justify-center"
          >
            <IconCircleCheck className="size-8 text-green-500" />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t.auth.resetPassword.successTitle()}
            </h2>
            <p className="text-muted-foreground">
              {t.auth.resetPassword.successDescription()}
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button asChild className="w-full h-12">
              <a href="/dashboard">{t.auth.resetPassword.goToLogin()}</a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-6"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">Y</span>
            </div>
            <span className="text-xl font-bold">{t.app.name()}</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t.auth.resetPassword.title()}
          </h2>
          <p className="text-muted-foreground">
            {t.auth.resetPassword.subtitle()}
          </p>
        </motion.div>

        <motion.form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          variants={itemVariants}
        >
          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.resetPassword.newPassword()}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t.auth.resetPassword.newPasswordPlaceholder()}
              disabled={isLoading}
              className="h-12"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.auth.resetPassword.confirmPassword()}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t.auth.resetPassword.confirmPasswordPlaceholder()}
              disabled={isLoading}
              className="h-12"
              {...form.register('confirmPassword')}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {t.auth.resetPassword.passwordMismatch()}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isLoading}
          >
            {isLoading
              ? (
                  <>
                    <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t.auth.resetPassword.submitting()}
                  </>
                )
              : t.auth.resetPassword.submit()}
          </Button>
        </motion.form>
      </motion.div>
    </div>
  )
}
