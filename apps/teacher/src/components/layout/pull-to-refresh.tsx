import type { ReactNode } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  className?: string
  threshold?: number
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
  threshold = 80,
}: PullToRefreshProps) {
  const { t } = useTranslation()
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const isPulling = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current
    if (!container || container.scrollTop > 0 || isRefreshing)
      return

    startY.current = e.touches[0]?.clientY ?? 0
    isPulling.current = true
  }, [isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing)
      return

    const currentY = e.touches[0]?.clientY ?? 0
    const diff = currentY - startY.current

    if (diff > 0) {
      // Apply resistance to pull
      const resistance = 0.4
      setPullDistance(Math.min(diff * resistance, threshold * 1.5))
    }
  }, [isRefreshing, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current)
      return
    isPulling.current = false

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold * 0.6) // Keep indicator visible

      try {
        await onRefresh()
      }
      finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    }
    else {
      setPullDistance(0)
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  const progress = Math.min(pullDistance / threshold, 1)
  const showIndicator = pullDistance > 10 || isRefreshing

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute left-1/2 z-10 flex -translate-x-1/2 items-center justify-center transition-opacity',
          showIndicator
            ? 'opacity-100'
            : 'opacity-0',
        )}
        style={{ top: Math.max(pullDistance - 40, 8) }}
      >
        <div className="flex flex-col items-center gap-1 rounded-full bg-background p-2 shadow-md">
          <IconLoader2
            className={cn(
              'h-5 w-5 text-primary',
              isRefreshing && 'animate-spin',
            )}
            style={{
              transform: isRefreshing
                ? undefined
                : `rotate(${progress * 360}deg)`,
            }}
          />
          <span className="text-xs text-muted-foreground">
            {isRefreshing
              ? t('common.refreshing')
              : t('common.pullToRefresh')}
          </span>
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling.current
            ? 'none'
            : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}
