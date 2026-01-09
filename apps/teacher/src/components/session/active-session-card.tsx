import { IconClock, IconPlayerPlay, IconUsers } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ActiveSessionCardProps {
  session: {
    id: string
    classId: string
    className: string
    subjectName: string
    startTime: string
    startedAt: string
  }
  onComplete?: () => void
}

export function ActiveSessionCard({ session, onComplete }: ActiveSessionCardProps) {
  const { t } = useTranslation()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const startTime = new Date(session.startedAt).getTime()
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [session.startedAt])

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
    <Card className="border-primary bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-medium text-primary">
                {t('session.active')}
              </span>
            </div>
            <h3 className="font-semibold">{session.className}</h3>
            <p className="text-sm text-muted-foreground">{session.subjectName}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <IconClock className="h-3.5 w-3.5" />
              <span>{t('session.timer')}</span>
            </div>
            <p className="font-mono text-lg font-semibold tabular-nums">
              {formatElapsed(elapsed)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link
              to="/app/sessions/$sessionId"
              params={{ sessionId: session.id }}
            >
              <IconUsers className="mr-1.5 h-4 w-4" />
              {t('session.participation')}
            </Link>
          </Button>
          <Button size="sm" className="flex-1" onClick={onComplete}>
            <IconPlayerPlay className="mr-1.5 h-4 w-4" />
            {t('session.complete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
