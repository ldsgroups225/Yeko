import {
  IconAlertCircle,
  IconCheck,
  IconMail,
  IconMessage,
  IconUsers,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
  Checkbox,
} from '@workspace/ui/components/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import {
  messageTemplatesQueryOptions,
  teacherParentContactsQueryOptions,
  teacherSentMessagesQueryOptions,
} from '@/lib/queries/parent-communication'

export const Route = createFileRoute('/_auth/app/communications')({
  component: CommunicationsPage,
})

function CommunicationsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('compose')

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">{t('communications.title')}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">{t('communications.compose')}</TabsTrigger>
          <TabsTrigger value="history">{t('communications.history')}</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-4">
          <BulkMessagingComposer />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <MessageHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BulkMessagingComposer() {
  const { t } = useTranslation()
  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [messageCategory, setMessageCategory] = useState<string>('')
  const [messagePriority, setMessagePriority] = useState<string>('normal')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    ...teacherParentContactsQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!context,
  })

  const { data: templatesData } = useQuery({
    ...messageTemplatesQueryOptions({
      schoolId: context?.schoolId ?? '',
    }),
    enabled: !!context,
  })

  const isLoading = contextLoading || contactsLoading

  const toggleRecipient = (parentId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(parentId)
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId],
    )
  }

  const selectAll = () => {
    if (contactsData?.contacts) {
      const allParentIds = contactsData.contacts.flatMap(c => c.parents.map(p => p.id))
      setSelectedRecipients(allParentIds)
    }
  }

  const deselectAll = () => {
    setSelectedRecipients([])
  }

  const handleSend = async () => {
    if (!context || selectedRecipients.length === 0 || !messageSubject || !messageContent) {
      return
    }

    setIsSending(true)
    // Simulate sending - in real implementation, call sendBulkMessagesFn
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSending(false)

    // Reset form
    setSelectedRecipients([])
    setMessageSubject('')
    setMessageContent('')
  }

  if (isLoading) {
    return <ComposerSkeleton />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('communications.recipients')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={selectAll}>
              {t('communications.selectAll')}
            </Button>
            <Button size="sm" variant="outline" onClick={deselectAll}>
              {t('communications.deselectAll')}
            </Button>
          </div>
          <div className="space-y-2">
            {contactsData?.contacts?.map(contact => (
              <div key={contact.student.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Checkbox
                    id={`student-${contact.student.id}`}
                    checked={contact.parents.every(p => selectedRecipients.includes(p.id))}
                    onCheckedChange={() => {
                      const parentIds = contact.parents.map(p => p.id)
                      const allSelected = parentIds.every(id => selectedRecipients.includes(id))
                      if (allSelected) {
                        setSelectedRecipients(prev => prev.filter(id => !parentIds.includes(id)))
                      } else {
                        setSelectedRecipients(prev => [...new Set([...prev, ...parentIds])])
                      }
                    }}
                  />
                  <label
                    htmlFor={`student-${contact.student.id}`}
                    className="font-medium"
                  >
                    {contact.student.name}
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {contact.student.class.name}
                  </span>
                </div>
                <div className="ml-6 space-y-1">
                  {contact.parents.map(parent => (
                    <div key={parent.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        id={`parent-${parent.id}`}
                        checked={selectedRecipients.includes(parent.id)}
                        onCheckedChange={() => toggleRecipient(parent.id)}
                      />
                      <label htmlFor={`parent-${parent.id}`}>
                        {parent.name}
                      </label>
                      <span className="text-muted-foreground">
                        ({parent.relationship})
                      </span>
                      {parent.phone && (
                        <span className="text-muted-foreground">{parent.phone}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('communications.selectedCount', { count: selectedRecipients.length })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('communications.message')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('communications.category')}</label>
              <Select value={messageCategory} onValueChange={setMessageCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('communications.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">{t('communications.categoryAttendance')}</SelectItem>
                  <SelectItem value="grades">{t('communications.categoryGrades')}</SelectItem>
                  <SelectItem value="behavior">{t('communications.categoryBehavior')}</SelectItem>
                  <SelectItem value="reminder">{t('communications.categoryReminder')}</SelectItem>
                  <SelectItem value="congratulations">{t('communications.categoryCongratulations')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('communications.priority')}</label>
              <Select value={messagePriority} onValueChange={setMessagePriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{t('communications.priorityNormal')}</SelectItem>
                  <SelectItem value="high">{t('communications.priorityHigh')}</SelectItem>
                  <SelectItem value="urgent">{t('communications.priorityUrgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('communications.subject')}</label>
            <input
              type="text"
              value={messageSubject}
              onChange={e => setMessageSubject(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={t('communications.subjectPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('communications.content')}</label>
            <textarea
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={5}
              placeholder={t('communications.contentPlaceholder')}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={selectedRecipients.length === 0 || !messageSubject || !messageContent || isSending}
            onClick={handleSend}
          >
            <IconMail className="mr-2 h-4 w-4" />
            {isSending
              ? t('communications.sending')
              : t('communications.sendToCount', { count: selectedRecipients.length })}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function MessageHistory() {
  const { t } = useTranslation()
  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data, isLoading } = useQuery({
    ...teacherSentMessagesQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      page: 1,
      pageSize: 20,
    }),
    enabled: !!context,
  })

  if (isLoading || contextLoading) {
    return <HistorySkeleton />
  }

  return (
    <div className="space-y-4">
      {data?.messages && data.messages.length > 0
        ? (
            data.messages.map(message => (
              <Card key={message.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{message.subject}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          message.priority === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : message.priority === 'high'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {message.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {message.studentName || t('communications.multipleStudents')}
                      </p>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString()} • {message.category}
                      </p>
                    </div>
                    <IconCheck className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            ))
          )
        : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <IconMessage className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {t('communications.noMessages')}
                </p>
              </CardContent>
            </Card>
          )}
    </div>
  )
}

function ComposerSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <Skeleton className="mt-2 h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
