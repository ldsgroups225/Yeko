import { createFileRoute, Link } from '@tanstack/react-router'
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
      <div className="
        bg-background flex min-h-screen items-center justify-center p-6
      "
      >
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">{t.auth.resetPassword.invalidLink()}</h2>
          <p className="text-muted-foreground">
            {t.auth.resetPassword.invalidLinkDescription()}
          </p>
          <Link
            to="/dashboard"
            className="
              text-primary
              hover:underline
            "
          >
            {t.auth.forgotPassword.backToLogin()}
          </Link>
        </div>
      </div>
    )
  }

  return <ResetPasswordForm token={token} />
}
