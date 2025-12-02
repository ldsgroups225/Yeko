import { Link } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link
        to="/app/dashboard"
        className={cn(
          'inline-flex items-center gap-1 transition-colors hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'rounded-sm',
        )}
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Accueil</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={item.href} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {item.href && !isLast
              ? (
                  <Link
                    to={item.href}
                    className={cn(
                      'transition-colors hover:text-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      'rounded-sm',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              : (
                  <span className={cn(isLast && 'font-medium text-foreground')}>{item.label}</span>
                )}
          </div>
        )
      })}
    </nav>
  )
}
