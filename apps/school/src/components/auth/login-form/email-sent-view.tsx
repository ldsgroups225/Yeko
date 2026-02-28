import { IconMail } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

interface EmailSentViewProps {
  email: string
  onBackToLogin: () => void
  onTryAgain: () => void
  containerVariants: any
  itemVariants: any
}

export function EmailSentView({
  email,
  onBackToLogin,
  onTryAgain,
  containerVariants,
  itemVariants,
}: EmailSentViewProps) {
  const t = useTranslations()

  return (
    <motion.div
      key="sent"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 text-center"
    >
      <motion.div
        variants={itemVariants}
        className="
          bg-primary/10 mx-auto flex size-16 items-center justify-center
          rounded-full
        "
      >
        <IconMail className="text-primary size-8" />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <h2 className="
          text-2xl font-bold tracking-tight
          sm:text-3xl
        "
        >
          {t.auth.forgotPassword.emailSentTitle()}
        </h2>
        <p className="text-muted-foreground">
          {t.auth.forgotPassword.emailSentDescription({
            email,
          })}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        <Button
          variant="outline"
          className="h-12 w-full"
          onClick={onBackToLogin}
        >
          {t.auth.forgotPassword.backToLogin()}
        </Button>
        <p className="text-muted-foreground text-sm">
          {t.auth.forgotPassword.noEmail()}
          {' '}
          <button
            type="button"
            onClick={onTryAgain}
            className="
              text-primary
              hover:text-primary/80
              transition-colors
            "
          >
            {t.auth.forgotPassword.tryAgain()}
          </button>
        </p>
      </motion.div>
    </motion.div>
  )
}
