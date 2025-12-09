/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SessionTimerProps {
  startedAt: string
  className?: string
}

export function SessionTimer({ startedAt, className }: SessionTimerProps) {
  const { t } = useTranslation()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const startTime = new Date(startedAt).getTime()
    const updateElapsed = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  const formatElapsed = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{t('session.timer')}</span>
      </div>
      <p className="font-mono text-2xl font-bold tabular-nums">
        {formatElapsed(elapsed)}
      </p>
    </div>
  )
}
