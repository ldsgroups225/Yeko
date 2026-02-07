import type { Locale } from 'date-fns'
import { IconArrowBackUp, IconArrowLeft, IconMail, IconStar, IconUser } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { format } from 'date-fns'

import { fr } from 'date-fns/locale'
import { useEffect } from 'react'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { messageDetailQueryOptions, messagesKeys, messagesMutations } from '@/lib/queries/messages'

export const Route = createFileRoute('/_auth/app/chat/$messageId')({
  component: MessageDetailPage,
})

function MessageDetailPage() {
  const { LL, locale: currentLocale } = useI18nContext()
  const locale = currentLocale === 'fr' ? fr : undefined
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
    ...messagesMutations.markRead,
    onMutate: async (variables) => {
      const id = variables.messageId

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: messagesKeys.lists() })
      await queryClient.cancelQueries({ queryKey: messagesKeys.detail(id) })

      // Snapshot the previous detail
      const previousDetail = queryClient.getQueryData(messagesKeys.detail(id))

      // Optimistically update the detail
      queryClient.setQueryData(messagesKeys.detail(id), (old: { message?: MessageContentProps['message'] } | undefined) => {
        if (!old || !old.message)
          return old
        return {
          ...old,
          message: {
            ...old.message,
            isRead: true,
          },
        }
      })

      return { previousDetail }
    },
    onError: (_err, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(messagesKeys.detail(variables.messageId), context.previousDetail)
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: messagesKeys.detail(variables.messageId) })
    },
  })

  // Mark as read when viewing
  useEffect(() => {
    if (data?.message && !data.message.isRead && context) {
      markReadMutation.mutate({
        messageId,
        teacherId: context.teacherId,
      })
    }
  }, [data?.message, context, messageId, markReadMutation])

  const isLoading = contextLoading || dataLoading
  const message = data?.message

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <div className="flex items-center gap-3">
        <Link to="/app/chat">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">{LL.messages.title()}</h1>
      </div>

      {isLoading
        ? (
            <MessageDetailSkeleton />
          )
        : message
          ? (
              <MessageContent
                message={message}
                teacherId={context?.teacherId ?? ''}
                locale={locale}
              />
            )
          : (
              <Card>
                <CardContent className="py-12 text-center">
                  <IconMail className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {LL.errors.notFound()}
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
    senderId: string
    senderName?: string | null
    recipientId: string
    recipientName?: string | null
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
      senderId: string
      senderName?: string | null
      content: string
      createdAt: string
    }>
  }
  teacherId: string
  locale?: Locale
}

function MessageContent({ message, teacherId, locale }: MessageContentProps) {
  const { LL } = useI18nContext()
  const date = new Date(message.createdAt)

  const senderDisplayName = message.senderId === teacherId
    ? LL.messages.you()
    : (message.senderName ?? LL.messages.unknownSender())

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <IconUser className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">
                  {senderDisplayName}
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
                <IconStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
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
            {LL.messages.thread()}
          </h3>
          {message.thread.map((reply) => {
            const replySenderDisplayName = reply.senderId === teacherId
              ? LL.messages.you()
              : (reply.senderName ?? LL.messages.unknownSender())

            return (
              <Card key={reply.id} className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {replySenderDisplayName}
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
            )
          })}
        </div>
      )}

      {/* Reply button */}
      <div className="fixed inset-x-0 bottom-16 border-t bg-background p-4">
        <Link
          to="/app/chat/compose"
          search={{ replyTo: message.id }}
          className="w-full"
        >
          <Button className="w-full">
            <IconArrowBackUp className="mr-2 h-4 w-4" />
            {LL.messages.reply()}
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
