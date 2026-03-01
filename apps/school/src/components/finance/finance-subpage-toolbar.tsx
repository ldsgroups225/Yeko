import type { ReactNode } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { buttonVariants } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

interface FinanceSubpageToolbarProps {
  backTo?: string
  className?: string
  actions?: ReactNode
  hideBackButton?: boolean
}

export function FinanceSubpageToolbar({
  backTo = '/settings/finance/setup',
  className,
  actions,
  hideBackButton = false,
}: FinanceSubpageToolbarProps) {
  const t = useTranslations()

  return (
    <div
      className={cn(
        `
          sticky top-16 z-40
          flex items-center justify-between gap-3
          sm:gap-4
        `,
        className,
      )}
    >
      <div className="shrink-0">
        {!hideBackButton && (
          <Link
            to={backTo}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              `
                border-border/50 bg-background/70
                hover:bg-background/90 hover:border-primary/40
                rounded-full px-4 shadow-lg backdrop-blur-xl transition-all
              `,
            )}
          >
            <IconArrowLeft className="mr-2 size-4" />
            {t.common.back()}
          </Link>
        )}
      </div>

      <div
        className={cn(
          `
            flex min-w-0 items-center justify-end gap-2
            sm:gap-3
          `,
        )}
      >
        {actions}
      </div>
    </div>
  )
}
