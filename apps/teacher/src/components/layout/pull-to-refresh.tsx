import type { CSSProperties, ReactNode } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useI18nContext } from '@/i18n/i18n-react'

import { cn } from '@/lib/utils'

const transitionStyle: CSSProperties = { transition: 'transform 0.2s ease-out' }
const noTransitionStyle: CSSProperties = { transition: 'none' }

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
  const { LL } = useI18nContext()
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

  const indicatorTopStyle = useMemo<CSSProperties>(
    () => ({ top: Math.max(pullDistance - 40, 8) }),
    [pullDistance],
  )

  const iconRotateStyle = useMemo<CSSProperties>(
    () => ({ transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)` }),
    [isRefreshing, progress],
  )

  const contentTransformStyle = useMemo<CSSProperties>(
    () => ({
      transform: `translateY(${pullDistance}px)`,
      ...(isPulling.current ? noTransitionStyle : transitionStyle),
    }),
    [pullDistance],
  )

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
          `
            absolute left-1/2 z-10 flex -translate-x-1/2 items-center
            justify-center transition-opacity
          `,
          showIndicator
            ? 'opacity-100'
            : 'opacity-0',
        )}
        style={indicatorTopStyle}
      >
        <div className="
          bg-background flex flex-col items-center gap-1 rounded-full p-2
          shadow-md
        "
        >
          <IconLoader2
            className={cn(
              'text-primary h-5 w-5',
              isRefreshing && 'animate-spin',
            )}
            style={iconRotateStyle}
          />
          <span className="text-muted-foreground text-xs">
            {isRefreshing
              ? LL.common.refreshing()
              : LL.common.pullToRefresh()}
          </span>
        </div>
      </div>

      {/* Content with pull offset */}
      <div style={contentTransformStyle}>
        {children}
      </div>
    </div>
  )
}
