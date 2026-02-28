import type { ReactNode } from 'react'
import { Drawer } from 'vaul'

import { cn } from '@/lib/utils'

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          className={cn(
            `
              bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto
              max-h-[96vh] flex-col rounded-t-2xl
            `,
            className,
          )}
        >
          {/* Handle */}
          <div className="
            bg-muted mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full
          "
          />

          {/* Header */}
          {(title || description) && (
            <div className="px-4 pt-4 pb-2">
              {title && (
                <Drawer.Title className="text-lg font-semibold">
                  {title}
                </Drawer.Title>
              )}
              {description && (
                <Drawer.Description className="
                  text-muted-foreground mt-1 text-sm
                "
                >
                  {description}
                </Drawer.Description>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto px-4 pt-2 pb-8">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

interface BottomSheetTriggerProps {
  children: ReactNode
  asChild?: boolean
}

export function BottomSheetTrigger({ children, asChild }: BottomSheetTriggerProps) {
  return (
    <Drawer.Trigger asChild={asChild}>
      {children}
    </Drawer.Trigger>
  )
}
