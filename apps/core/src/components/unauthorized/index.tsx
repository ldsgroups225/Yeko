import {
  IconArrowLeft,
  IconMail,
  IconShieldLock,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { AnimatePresence, domAnimation, LazyMotion, m } from 'motion/react'
import { useTranslations } from '@/i18n/hooks'

export function UnauthorizedPage() {
  const t = useTranslations()

  return (
    <div className="
      bg-background relative flex min-h-screen w-full items-center
      justify-center overflow-hidden p-4 font-sans
    "
    >
      {/* Dynamic Background Gradients */}
      <div className="
        bg-primary/10 absolute top-[-10%] right-[-10%] h-[50%] w-[50%]
        animate-pulse rounded-full blur-[120px]
      "
      />
      <div className="
        bg-secondary/10 absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%]
        animate-pulse rounded-full blur-[120px]
      "
      />
      <div className="
        bg-primary/5 absolute top-1/2 left-1/2 h-[30%] w-[30%] -translate-x-1/2
        -translate-y-1/2 rounded-full blur-[100px]
      "
      />

      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="relative z-10 w-full max-w-xl"
          >
            {/* Main Card */}
            <div className="group relative">
              {/* Glow Effect */}
              <div className="
                from-primary/30 to-secondary/30 absolute -inset-0.5 rounded-3xl
                bg-linear-to-r opacity-20 blur-sm transition duration-1000
                group-hover:opacity-40 group-hover:duration-200
              "
              />

              <div className="
                glass relative overflow-hidden rounded-3xl p-8 shadow-2xl
                md:p-12
              "
              >
                {/* Decorative sparkle */}
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <div className="
                    from-primary/40 h-20 w-20 rounded-full bg-linear-to-br
                    to-transparent blur-2xl
                  "
                  />
                </div>

                {/* Icon Section */}
                <div className="mb-8 flex justify-center">
                  <m.div
                    initial={{ rotate: -15, scale: 0.5 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="relative"
                  >
                    <div className="
                      bg-primary/20 absolute inset-0 rounded-full blur-xl
                    "
                    />
                    <div className="
                      from-primary/20 to-primary/5 border-primary/20 relative
                      rounded-2xl border bg-linear-to-b p-5 shadow-inner
                    "
                    >
                      <IconShieldLock size={48} className="text-primary" stroke={1.5} />
                    </div>
                  </m.div>
                </div>

                {/* Text Content */}
                <div className="mb-10 space-y-4 text-center">
                  <m.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="
                      text-3xl font-extrabold tracking-tight
                      md:text-4xl
                    "
                  >
                    <span className="
                      from-foreground via-foreground to-foreground/60
                      bg-linear-to-r bg-clip-text text-transparent
                    "
                    >
                      {t.unauthorized.title()}
                    </span>
                  </m.h1>

                  <m.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground text-lg font-medium"
                  >
                    {t.unauthorized.description()}
                  </m.p>

                  <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="
                      bg-muted border-border group/info relative mt-6
                      rounded-2xl border p-5 backdrop-blur-sm
                    "
                  >
                    <div className="
                      bg-primary/5 absolute inset-0 rounded-2xl opacity-0
                      transition-opacity
                      group-hover/info:opacity-100
                    "
                    />
                    <p className="
                      text-foreground relative leading-relaxed font-medium
                      italic
                    "
                    >
                      "
                      {t.unauthorized.hint()}
                      "
                    </p>
                  </m.div>
                </div>

                {/* Actions */}
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="
                    flex flex-col justify-center gap-4
                    sm:flex-row
                  "
                >
                  <Button
                    size="lg"
                    className="
                      bg-primary
                      hover:bg-primary/90
                      text-primary-foreground shadow-primary/20
                      hover:shadow-primary/40
                      rounded-full px-8 font-semibold shadow-lg transition-all
                      duration-300
                      hover:-translate-y-0.5
                    "
                    render={(
                      <Link to="/">
                        <IconArrowLeft size={18} className="mr-2" />
                        {t.unauthorized.backHome()}
                      </Link>
                    )}
                  />

                  <Button
                    variant="outline"
                    size="lg"
                    className="
                      border-border bg-background/50
                      hover:bg-accent
                      text-foreground rounded-full px-8 font-semibold
                      backdrop-blur-md transition-all duration-300
                      hover:-translate-y-0.5
                    "
                    render={(
                      <a
                        href="mailto:support@yeko.app"
                        className="flex items-center"
                      >
                        <IconMail size={18} className="text-primary mr-2" />
                        {t.unauthorized.contactSupport()}
                      </a>
                    )}
                  />
                </m.div>
              </div>
            </div>

            {/* Footer Detail */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 flex flex-col items-center space-y-2"
            >
              <div className="
                bg-muted border-border rounded-full border px-3 py-1
              "
              >
                <span className="
                  text-muted-foreground text-[10px] font-bold tracking-[0.2em]
                  uppercase
                "
                >
                  {t.unauthorized.errorCode()}
                </span>
              </div>
            </m.div>
          </m.div>
        </AnimatePresence>
      </LazyMotion>

      {/* Footer Text */}
      <div className="
        text-muted-foreground absolute bottom-8 left-1/2 -translate-x-1/2
        text-xs font-medium tracking-wide
      "
      >
        {t.footerNav.copyright({
          year: new Date().getFullYear(),
        })}
      </div>
    </div>
  )
}
