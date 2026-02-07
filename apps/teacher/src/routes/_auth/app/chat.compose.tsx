import { IconArrowLeft, IconSearch, IconSend, IconUser } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'

import { Skeleton } from '@workspace/ui/components/skeleton'
import { Textarea } from '@workspace/ui/components/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { messagesMutations, parentSearchQueryOptions } from '@/lib/queries/messages'

const searchParamsSchema = z.object({
  replyTo: z.string().optional(),
})

export const Route = createFileRoute('/_auth/app/chat/compose')({
  validateSearch: searchParamsSchema,
  component: ComposeMessagePage,
})

function ComposeMessagePage() {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { replyTo } = Route.useSearch()

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedParent, setSelectedParent] = useState<{
    id: string
    name: string
    studentName: string
    className: string
  } | null>(null)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')

  const { data: searchResults, isPending: searchPending } = useQuery({
    ...parentSearchQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
      query: searchQuery,
    }),
    enabled: !!context && searchQuery.length >= 2,
  })

  const sendMutation = useMutation({
    ...messagesMutations.send,
    onSuccess: () => {
      toast.success(LL.messages.sentSuccess())
      queryClient.invalidateQueries({ queryKey: ['teacher', 'messages'] })
      navigate({ to: '/app/chat' })
    },
    onError: () => {
      toast.error(LL.errors.serverError())
    },
  })

  const handleSend = () => {
    if (!context || !selectedParent || !content.trim())
      return

    sendMutation.mutate({
      teacherId: context.teacherId,
      schoolId: context.schoolId,
      recipientId: selectedParent.id,
      subject: subject.trim() || undefined,
      content: content.trim(),
      replyToId: replyTo,
    })
  }

  const isPending = contextLoading

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/app/chat">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">{LL.messages.compose()}</h1>
      </div>

      {isPending
        ? <ComposeSkeleton />
        : (
            <div className="space-y-4">
              {/* Recipient selection */}
              <div className="space-y-2">
                <Label>{LL.messages.to()}</Label>
                {selectedParent
                  ? (
                      <Card>
                        <CardContent className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <IconUser className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {selectedParent.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {selectedParent.studentName}
                                {' '}
                                •
                                {selectedParent.className}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedParent(null)}
                          >
                            {LL.common.edit()}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  : (
                      <div className="space-y-2">
                        <div className="relative">
                          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder={LL.messages.searchParent()}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        {searchQuery.length >= 2 && (
                          <Card>
                            <CardContent className="p-2">
                              {searchPending
                                ? (
                                    <div className="space-y-2 p-2">
                                      <Skeleton className="h-10 w-full" />
                                      <Skeleton className="h-10 w-full" />
                                    </div>
                                  )
                                : searchResults && searchResults.length > 0
                                  ? (
                                      <div className="max-h-48 space-y-1 overflow-y-auto">
                                        {searchResults.map(parent => (
                                          <button
                                            type="button"
                                            key={parent.id}
                                            className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-muted"
                                            onClick={() => {
                                              setSelectedParent({
                                                id: parent.id,
                                                name: parent.name,
                                                studentName: parent.studentName,
                                                className: parent.className,
                                              })
                                              setSearchQuery('')
                                            }}
                                          >
                                            {' '}
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                              <IconUser className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium">
                                                {parent.name}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {parent.studentName}
                                                {' '}
                                                •
                                                {parent.className}
                                              </p>
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    )
                                  : (
                                      <p className="p-2 text-center text-sm text-muted-foreground">
                                        {LL.common.noResults()}
                                      </p>
                                    )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label>{LL.messages.subject()}</Label>
                <Input
                  placeholder={LL.messages.subject()}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label>{LL.messages.content()}</Label>
                <Textarea
                  placeholder={LL.messages.content()}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>
          )}

      {/* Send button */}
      <div className="fixed inset-x-0 bottom-16 border-t bg-background p-4">
        <Button
          className="w-full"
          onClick={handleSend}
          disabled={!selectedParent || !content.trim() || sendMutation.isPending}
        >
          <IconSend className="mr-2 h-4 w-4" />
          {LL.messages.send()}
        </Button>
      </div>
    </div>
  )
}

function ComposeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}
