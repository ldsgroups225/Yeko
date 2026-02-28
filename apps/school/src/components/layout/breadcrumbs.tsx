import { IconChevronRight, IconHome } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const t = useTranslations()

  return (
    <motion.nav
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="text-muted-foreground flex items-center gap-2 text-sm"
    >
      <Link
        to="/dashboard"
        className={cn(
          `
            hover:text-foreground
            inline-flex items-center gap-1 transition-colors
          `,
          `
            focus-visible:ring-ring focus-visible:ring-2
            focus-visible:ring-offset-2 focus-visible:outline-none
          `,
          'rounded-sm',
        )}
      >
        <IconHome className="h-4 w-4" />
        <span className="sr-only">{t.common.home()}</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <motion.div
            key={item.href || `breadcrumb-${index}`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <IconChevronRight className="h-4 w-4" />
            {item.href && !isLast
              ? (
                  <Link
                    to={item.href}
                    className={cn(
                      `
                        hover:text-foreground
                        transition-colors
                      `,
                      `
                        focus-visible:ring-ring focus-visible:ring-2
                        focus-visible:ring-offset-2 focus-visible:outline-none
                      `,
                      'rounded-sm',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              : (
                  <span className={cn(isLast && 'text-foreground font-medium')}>{item.label}</span>
                )}
          </motion.div>
        )
      })}
    </motion.nav>
  )
}
