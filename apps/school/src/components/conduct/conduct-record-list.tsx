import { FileWarning } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

import { generateUUID } from '@/utils/generateUUID'
import { ConductRecordCard } from './conduct-record-card'

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

interface ConductRecordListProps {
  records: ConductRecord[]
  isLoading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ConductRecordList({
  records,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: ConductRecordListProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return <ConductRecordListSkeleton />
  }

  if (records.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileWarning className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>{t('conduct.noRecords')}</EmptyTitle>
          <EmptyDescription>{t('conduct.noRecordsDescription')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {records.map(record => (
        <ConductRecordCard
          key={record.id}
          record={record}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

function ConductRecordListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map(() => (
        <Skeleton key={generateUUID()} className="h-48 w-full" />
      ))}
    </div>
  )
}
