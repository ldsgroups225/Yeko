import * as React from 'react'
import { cn } from '@workspace/ui/lib/utils'

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function PageHeader({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)} {...props}>
      <div>
        <h1 className={cn('text-3xl font-bold tracking-tight text-foreground', titleClassName)}>
          {title}
        </h1>
        {description && (
          <p className={cn('text-muted-foreground', descriptionClassName)}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
