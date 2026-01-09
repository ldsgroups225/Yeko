import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { useTranslations } from '@/i18n'

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/reset-password')({
  validateSearch: searchSchema,
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const t = useTranslations()

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">{t.auth.resetPassword.invalidLink()}</h2>
          <p className="text-muted-foreground">
            {t.auth.resetPassword.invalidLinkDescription()}
          </p>
          <a href="/dashboard" className="text-primary hover:underline">
            {t.auth.forgotPassword.backToLogin()}
          </a>
        </div>
      </div>
    )
  }

  return <ResetPasswordForm token={token} />
}
