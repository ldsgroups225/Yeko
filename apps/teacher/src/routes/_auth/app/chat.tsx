import type { Locale } from 'date-fns'
import {
  IconArchive,
  IconInbox,
  IconMail,
  IconMessageCircle,
  IconPencil,
  IconSend,
  IconStar,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState } from 'react'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { teacherMessagesQueryOptions } from '@/lib/queries/messages'

export const Route = createFileRoute('/_auth/app/chat')({
  component: MessagesPage,
})

function MessagesPage() {
  const { LL, locale: currentLocale } = useI18nContext()
  const locale = currentLocale === 'fr' ? fr : undefined
  const [folder, setFolder] = useState<'inbox' | 'sent' | 'archived'>('inbox')

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data, isLoading: dataLoading } = useQuery({
    ...teacherMessagesQueryOptions({
      teacherId: context?.teacherId ?? '',
      folder,
    }),
    enabled: !!context,
  })

  const isLoading = contextLoading || dataLoading

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{LL.messages.title()}</h1>
        <Link to="/app/chat/compose">
          <Button size="sm">
            <IconPencil className="mr-2 h-4 w-4" />
            {LL.messages.compose()}
          </Button>
        </Link>
      </div>

      <Tabs value={folder} onValueChange={v => setFolder(v as typeof folder)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inbox" className="gap-1.5">
            <IconInbox className="h-4 w-4" />
            <span className="hidden sm:inline">{LL.messages.inbox()}</span>
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-1.5">
            <IconSend className="h-4 w-4" />
            <span className="hidden sm:inline">{LL.messages.sent()}</span>
          </TabsTrigger>
          <TabsTrigger value="archived" className="gap-1.5">
            <IconArchive className="h-4 w-4" />
            <span className="hidden sm:inline">{LL.messages.archived()}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={folder} className="mt-4">
          {isLoading
            ? (
                <MessagesSkeleton />
              )
            : data?.messages && data.messages.length > 0
              ? (
                  <div className="space-y-2">
                    {data.messages.map(message => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        locale={locale}
                      />
                    ))}
                  </div>
                )
              : (
                  <EmptyMessages folder={folder} />
                )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MessageItemProps {
  message: {
    id: string
    senderType: 'teacher' | 'parent'
    senderName: string
    recipientName: string
    studentName: string | null
    subject: string | null
    preview: string
    isRead: boolean
    isStarred: boolean
    createdAt: string
  }
  locale?: Locale
}

function MessageItem({ message, locale }: MessageItemProps) {
  const date = new Date(message.createdAt)
  const isToday = new Date().toDateString() === date.toDateString()

  return (
    <Link to="/app/chat/$messageId" params={{ messageId: message.id }}>
      <Card
        className={`transition-colors hover:bg-muted/50 ${!message.isRead ? 'border-primary/50 bg-primary/5' : ''}`}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <IconMail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`truncate text-sm ${!message.isRead ? 'font-semibold' : 'font-medium'}`}
                >
                  {message.senderType === 'parent'
                    ? message.senderName
                    : message.recipientName}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {isToday
                    ? format(date, 'HH:mm')
                    : format(date, 'd MMM', { locale })}
                </span>
              </div>
              {message.studentName && (
                <p className="text-xs text-muted-foreground">
                  {message.studentName}
                </p>
              )}
              {message.subject && (
                <p className="truncate text-sm text-muted-foreground">
                  {message.subject}
                </p>
              )}
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {message.preview}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              {message.isStarred && (
                <IconStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
              {!message.isRead && (
                <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function EmptyMessages({ folder }: { folder: string }) {
  const { LL } = useI18nContext()

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <IconMessageCircle className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          {LL.messages.noMessages()}
        </p>
        {folder === 'inbox' && (
          <Link to="/app/chat/compose">
            <Button variant="outline" className="mt-4">
              <IconPencil className="mr-2 h-4 w-4" />
              {LL.messages.compose()}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

function MessagesSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map(i => (
        <Card key={i}>
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
