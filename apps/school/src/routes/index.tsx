import { IconChevronRight } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  const { t } = useTranslation()

  return (
    <main className="
      flex min-h-screen items-center justify-center p-4
      sm:p-6
      lg:p-8
    "
    >
      <div className="
        animate-in fade-in zoom-in-95 w-full max-w-md duration-500
      "
      >
        <div className="
          bg-card border-border/50 relative overflow-hidden rounded-xl border
          p-8 shadow-lg
        "
        >
          <div className="
            from-primary/5 pointer-events-none absolute inset-0 bg-linear-to-br
            via-transparent to-transparent
          "
          />

          <div className="relative space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="
                  bg-primary/20 absolute inset-0 animate-pulse rounded-full
                  blur-2xl
                "
                />
                <div className="
                  bg-primary/10 ring-primary/20 relative rounded-2xl p-5 ring-1
                "
                >
                  <img
                    src="/icon.png"
                    alt="Yeko logo"
                    className="h-12 w-12 object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h1 className="
                text-foreground text-2xl font-bold tracking-tight
                sm:text-3xl
              "
              >
                {t('app.name')}
              </h1>
              <p className="
                text-muted-foreground text-sm
                sm:text-base
              "
              >
                {t('app.tagline')}
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/accounting/dashboard"
                className="
                  group bg-primary text-primary-foreground
                  hover:bg-primary/90
                  relative flex w-full items-center justify-center gap-2
                  rounded-lg px-6 py-3 font-medium shadow-md transition-all
                  duration-200 ease-out
                  hover:-translate-y-0.5 hover:shadow-lg
                  active:translate-y-0 active:shadow-sm
                "
              >
                <span>{t('finance.dashboard.title')}</span>
                <IconChevronRight className="
                  h-4 w-4 transition-transform duration-200
                  group-hover:translate-x-0.5
                "
                />
                <div className="
                  bg-primary/20 absolute inset-0 -z-10 rounded-lg opacity-0
                  blur-sm transition-opacity duration-200
                  group-hover:opacity-100
                "
                />
              </Link>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground/60 mt-6 text-center text-xs">
          {t('app.footer')}
        </p>
      </div>
    </main>
  )
}
