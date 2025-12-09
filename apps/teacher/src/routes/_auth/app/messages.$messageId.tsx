import type { Locale } from 'date-fns'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Mail, Reply, Star, User } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { messageDetailQueryOptions } from '@/lib/queries/messages'
import { markMessageRead } from '@/teacher/functions/messages'

export const Route = createFileRoute('/_auth/app/messages/$messageId')({
  component: MessageDetailPage,
})

function MessageDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'fr' ? fr : undefined
  const { messageId } = Route.useParams()
  const queryClient = useQueryClient()

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data, isLoading: dataLoading } = useQuery({
    ...messageDetailQueryOptions({
      messageId,
      teacherId: context?.teacherId ?? '',
    }),
    enabled: !!context,
  })

  const markReadMutation = useMutation({
    mutationFn: markMessageRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'messages'] })
    },
  })

  // Mark as read when viewing
  useEffect(() => {
    if (data?.message && !data.message.isRead && context) {
      markReadMutation.mutate({
        data: {
          messageId,
          teacherId: context.teacherId,
        },
      })
    }
  }, [data?.message, context, messageId, markReadMutation])

  const isLoading = contextLoading || dataLoading
  const message = data?.message

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <div className="flex items-center gap-3">
        <Link to="/app/messages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">{t('messages.title')}</h1>
      </div>

      {isLoading
        ? (
            <MessageDetailSkeleton />
          )
        : message
          ? (
              <MessageContent message={message} locale={locale} />
            )
          : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t('errors.notFound')}
                  </p>
                </CardContent>
              </Card>
            )}
    </div>
  )
}

interface MessageContentProps {
  message: {
    id: string
    senderType: 'teacher' | 'parent'
    senderName?: string
    recipientName?: string
    studentName: string | null
    className: string | null
    subject: string | null
    content: string
    isRead: boolean
    isStarred?: boolean
    createdAt: string
    thread?: Array<{
      id: string
      senderType: 'teacher' | 'parent'
      content: string
      createdAt: string
    }>
  }
  locale?: Locale
}

function MessageContent({ message, locale }: MessageContentProps) {
  const { t } = useTranslation()
  const date = new Date(message.createdAt)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">
                  {message.senderType === 'parent'
                    ? message.senderName ?? t('messages.parent')
                    : t('messages.you')}
                </p>
                {message.studentName && (
                  <p className="text-xs text-muted-foreground">
                    {message.studentName}
                    {message.className && ` • ${message.className}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {message.isStarred && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
              <span className="text-xs text-muted-foreground">
                {format(date, 'd MMM yyyy, HH:mm', { locale })}
              </span>
            </div>
          </div>
          {message.subject && (
            <h2 className="mt-2 text-base font-medium">{message.subject}</h2>
          )}
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        </CardContent>
      </Card>

      {/* Thread messages */}
      {message.thread && message.thread.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t('messages.thread', 'Conversation')}
          </h3>
          {message.thread.map(reply => (
            <Card key={reply.id} className="bg-muted/30">
              <CardContent className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium">
                    {reply.senderType === 'parent'
                      ? t('messages.parent')
                      : t('messages.you')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(reply.createdAt), 'd MMM, HH:mm', {
                      locale,
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{reply.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply button */}
      <div className="fixed inset-x-0 bottom-16 border-t bg-background p-4">
        <Link
          to="/app/messages/compose"
          search={{ replyTo: message.id }}
          className="w-full"
        >
          <Button className="w-full">
            <Reply className="mr-2 h-4 w-4" />
            {t('messages.reply')}
          </Button>
        </Link>
      </div>
    </div>
  )
}

function MessageDetailSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="mt-2 h-5 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}
