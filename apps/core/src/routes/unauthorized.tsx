import {
  IconArrowLeft,
  IconMail,
  IconShieldLock,
} from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { AnimatePresence, motion } from 'motion/react'

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
})

function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="max-w-xl w-full relative z-10"
        >
          {/* Main Card */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary/30 to-secondary/30 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

            <div className="relative glass rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
              {/* Decorative sparkle */}
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <div className="w-20 h-20 bg-linear-to-br from-primary/40 to-transparent rounded-full blur-2xl" />
              </div>

              {/* Icon Section */}
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ rotate: -15, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <div className="relative bg-linear-to-b from-primary/20 to-primary/5 p-5 rounded-2xl border border-primary/20 shadow-inner">
                    <IconShieldLock size={48} className="text-primary" stroke={1.5} />
                  </div>
                </motion.div>
              </div>

              {/* Text Content */}
              <div className="text-center space-y-4 mb-10">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-extrabold tracking-tight"
                >
                  <span className="bg-linear-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                    Accès Non Autorisé
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-muted-foreground font-medium"
                >
                  Désolé, votre compte n'a pas encore les permissions nécessaires.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 p-5 rounded-2xl bg-muted border border-border backdrop-blur-sm relative group/info"
                >
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/info:opacity-100 transition-opacity rounded-2xl" />
                  <p className="text-foreground font-medium relative italic leading-relaxed">
                    "En attendant l'attribution de votre rôle par l'administrateur, ou contactez-le pour plus d'informations."
                  </p>
                </motion.div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  size="lg"
                  className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
                  render={(
                    <Link to="/">
                      <IconArrowLeft size={18} className="mr-2" />
                      Retour à l'accueil
                    </Link>
                  )}
                />

                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 border-border bg-background/50 hover:bg-accent text-foreground font-semibold transition-all duration-300 backdrop-blur-md hover:-translate-y-0.5"
                  render={(
                    <a href="mailto:support@yeko.app" className="flex items-center">
                      <IconMail size={18} className="mr-2 text-primary" />
                      Contacter le support
                    </a>
                  )}
                />
              </motion.div>
            </div>
          </div>

          {/* Footer Detail */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex flex-col items-center space-y-2"
          >
            <div className="px-3 py-1 rounded-full bg-muted border border-border">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                Error Code 403 • Unauthorized Access
              </span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Footer Text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground text-xs font-medium tracking-wide">
        &copy;
        {' '}
        {new Date().getFullYear()}
        {' '}
        Yeko Platform • Tous droits réservés
      </div>
    </div>
  )
}
