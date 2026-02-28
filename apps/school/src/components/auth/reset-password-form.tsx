import { zodResolver } from '@hookform/resolvers/zod'
import { IconCircleCheck, IconLoader2 } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
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
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsPending(true)
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
      setIsPending(false)
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
      <div className="
        bg-background flex min-h-screen items-center justify-center p-6
      "
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md space-y-6 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="
              mx-auto flex size-16 items-center justify-center rounded-full
              bg-green-500/10
            "
          >
            <IconCircleCheck className="size-8 text-green-500" />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <h2 className="
              text-2xl font-bold tracking-tight
              sm:text-3xl
            "
            >
              {t.auth.resetPassword.successTitle()}
            </h2>
            <p className="text-muted-foreground">
              {t.auth.resetPassword.successDescription()}
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              className="h-12 w-full"
              render={
                <Link to="/dashboard">{t.auth.resetPassword.goToLogin()}</Link>
              }
            />
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="
      bg-background flex min-h-screen items-center justify-center p-6
    "
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-6"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="
              bg-primary flex size-10 items-center justify-center rounded-xl
            "
            >
              <span className="text-primary-foreground text-xl font-bold">
                Y
              </span>
            </div>
            <span className="text-xl font-bold">{t.app.name()}</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h2 className="
            text-2xl font-bold tracking-tight
            sm:text-3xl
          "
          >
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
            <Label htmlFor="password">
              {t.auth.resetPassword.newPassword()}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={t.auth.resetPassword.newPasswordPlaceholder()}
              disabled={isPending}
              className="h-12"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-destructive text-sm">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t.auth.resetPassword.confirmPassword()}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t.auth.resetPassword.confirmPasswordPlaceholder()}
              disabled={isPending}
              className="h-12"
              {...form.register('confirmPassword')}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-destructive text-sm">
                {t.auth.resetPassword.passwordMismatch()}
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
                    {t.auth.resetPassword.submitting()}
                  </>
                )
              : (
                  t.auth.resetPassword.submit()
                )}
          </Button>
        </motion.form>
      </motion.div>
    </div>
  )
}
