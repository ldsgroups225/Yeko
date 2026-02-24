import { useState } from 'react'
import { BrandPanel } from './login-form/brand-panel'
import { EmailSentView } from './login-form/email-sent-view'
import { ForgotPasswordView } from './login-form/forgot-password-view'
import { LoginView } from './login-form/login-view'

type AuthView = 'login' | 'forgot-password' | 'email-sent'

export function LoginForm() {
  const [view, setView] = useState<AuthView>('login')
  const [sentEmail, setSentEmail] = useState('')

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
      <BrandPanel />

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {view === 'login' && (
            <LoginView
              onForgotPassword={() => setView('forgot-password')}
              containerVariants={containerVariants}
              itemVariants={itemVariants}
            />
          )}

          {view === 'forgot-password' && (
            <ForgotPasswordView
              onBackToLogin={() => setView('login')}
              onEmailSent={(email) => {
                setSentEmail(email)
                setView('email-sent')
              }}
              containerVariants={containerVariants}
              itemVariants={itemVariants}
            />
          )}

          {view === 'email-sent' && (
            <EmailSentView
              email={sentEmail}
              onBackToLogin={() => setView('login')}
              onTryAgain={() => setView('forgot-password')}
              containerVariants={containerVariants}
              itemVariants={itemVariants}
            />
          )}
        </div>
      </div>
    </div>
  )
}
