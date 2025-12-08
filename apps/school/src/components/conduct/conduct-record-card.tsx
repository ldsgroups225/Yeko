import { Calendar, MapPin, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConductSeverityBadge } from './conduct-severity-badge'
import { ConductStatusBadge } from './conduct-status-badge'
import { ConductTypeBadge } from './conduct-type-badge'

type ConductType = 'incident' | 'sanction' | 'reward' | 'note'
type ConductSeverity = 'low' | 'medium' | 'high' | 'critical'
type ConductStatus = 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed'

interface ConductRecord {
  id: string
  studentId: string
  studentName: string
  studentPhoto?: string | null
  type: ConductType
  category: string
  title: string
  description: string
  severity?: ConductSeverity | null
  status: ConductStatus
  incidentDate?: string | null
  location?: string | null
  createdAt: string
}

interface ConductRecordCardProps {
  record: ConductRecord
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ConductRecordCard({
  record,
  onView,
  onEdit,
  onDelete,
}: ConductRecordCardProps) {
  const { t } = useTranslation()

  const initials = record.studentName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={record.studentPhoto ?? undefined} alt={record.studentName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{record.studentName}</div>
            <div className="text-sm text-muted-foreground">{record.title}</div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t('common.actions')}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(record.id)}>
                {t('common.view')}
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(record.id)}>
                {t('common.edit')}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(record.id)}
                className="text-destructive"
              >
                {t('common.delete')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {record.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <ConductTypeBadge type={record.type} />
          {record.severity && <ConductSeverityBadge severity={record.severity} />}
          <ConductStatusBadge status={record.status} />
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {record.incidentDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(record.incidentDate).toLocaleDateString('fr-FR')}
            </div>
          )}
          {record.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {record.location}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
