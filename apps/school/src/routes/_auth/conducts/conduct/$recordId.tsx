import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Calendar, MapPin, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConductSeverityBadge } from '@/components/conduct/conduct-severity-badge'
import { ConductStatusBadge } from '@/components/conduct/conduct-status-badge'
import { ConductTypeBadge } from '@/components/conduct/conduct-type-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { conductRecordOptions } from '@/lib/queries/conduct-records'
import { changeStatus } from '@/school/functions/conduct-records'

export const Route = createFileRoute('/_auth/conducts/conduct/$recordId')({
  component: ConductRecordDetailPage,
})

function ConductRecordDetailPage() {
  const { t } = useTranslation()
  const { recordId } = Route.useParams()
  const queryClient = useQueryClient()

  const { data: record, isLoading } = useQuery(conductRecordOptions(recordId))

  const statusMutation = useMutation({
    mutationFn: changeStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conduct-records'] })
      toast.success(t('conduct.statusUpdated'))
    },
  })

  const handleStatusChange = (status: string) => {
    statusMutation.mutate({
      data: {
        id: recordId,
        status: status as 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed',
      },
    })
  }

  if (isLoading) {
    return <ConductRecordDetailSkeleton />
  }

  if (!record) {
    return (
      <div className="container py-6">
        <p>{t('conduct.notFound')}</p>
      </div>
    )
  }

  const initials = (record.studentName ?? 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link to="/conducts/conduct">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{record.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <ConductTypeBadge type={record.type as 'incident' | 'sanction' | 'reward' | 'note'} />
                    {record.severity && (
                      <ConductSeverityBadge severity={record.severity as 'low' | 'medium' | 'high' | 'critical'} />
                    )}
                    <ConductStatusBadge status={record.status as 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed'} />
                  </div>
                </div>
                <Select value={record.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t('conduct.status.open')}</SelectItem>
                    <SelectItem value="investigating">{t('conduct.status.investigating')}</SelectItem>
                    <SelectItem value="pending_decision">{t('conduct.status.pending_decision')}</SelectItem>
                    <SelectItem value="resolved">{t('conduct.status.resolved')}</SelectItem>
                    <SelectItem value="closed">{t('conduct.status.closed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{record.description}</p>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {record.incidentDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(record.incidentDate).toLocaleDateString('fr-FR')}
                    {record.incidentTime && ` ${record.incidentTime}`}
                  </div>
                )}
                {record.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {record.location}
                  </div>
                )}
              </div>

              {record.witnesses && record.witnesses.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">{t('conduct.form.witnesses')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {record.witnesses.map((witness: string) => (
                      <span key={witness} className="text-sm bg-muted px-2 py-1 rounded">
                        {witness}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {record.resolutionNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('conduct.resolution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{record.resolutionNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('conduct.student')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={record.studentPhoto ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{record.studentName ?? 'Unknown'}</div>
                  <div className="text-sm text-muted-foreground">{record.studentMatricule}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('conduct.recordedBy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{record.recordedByName ?? 'Unknown'}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(record.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ConductRecordDetailSkeleton() {
  return (
    <div className="container py-6">
      <Skeleton className="h-8 w-24 mb-6" />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  )
}
