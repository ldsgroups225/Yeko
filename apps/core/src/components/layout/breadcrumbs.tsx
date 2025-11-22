import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

// Translation map for route segments (English -> French)
const segmentTranslations: Record<string, string> = {
  app: 'App',
  dashboard: 'Tableau de bord',
  schools: 'Écoles',
  catalogs: 'Catalogues',
  programs: 'Programmes',
  subjects: 'Matières',
  coefficients: 'Coefficients',
  analytics: 'Analytiques',
  support: 'Support',
  create: 'Créer',
}

function translateSegment(segment: string): string {
  return segmentTranslations[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
}

function getBreadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)

  // Skip 'app' segment in breadcrumbs as it's redundant
  const relevantSegments = segments.filter(seg => seg !== 'app')

  if (relevantSegments.length === 0) {
    return []
  }

  return relevantSegments.map((segment, index) => {
    // Build href up to this segment (including 'app' prefix)
    const segmentIndex = segments.indexOf(segment)
    const href = `/${segments.slice(0, segmentIndex + 1).join('/')}`

    return {
      label: translateSegment(segment),
      href: index < relevantSegments.length - 1 ? href : undefined,
    }
  })
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const breadcrumbItems = items || getBreadcrumbsForPath(pathname)

  if (breadcrumbItems.length === 0) {
    return null
  }

  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}>
      <Link to="/app/dashboard" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1

        return (
          <div key={generateUUID()} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4" />
            {item.href && !isLast
              ? (
                <Link to={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              )
              : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
          </div>
        )
      })}
    </nav>
  )
}
