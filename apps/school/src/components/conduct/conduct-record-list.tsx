import { IconFileAlert, IconPlus } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
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
  const t = useTranslations()

  if (isLoading) {
    return <ConductRecordListSkeleton />
  }

  if (records.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-dashed border-border/60 bg-card/20 backdrop-blur-sm p-12 flex flex-col items-center text-center"
      >
        <div className="p-6 rounded-full bg-background/50 mb-6 shadow-inner">
          <IconFileAlert className="size-12 text-muted-foreground/20" />
        </div>
        <h3 className="text-xl font-bold text-muted-foreground mb-2">{t.conduct.noRecords()}</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-8">{t.conduct.noRecordsDescription()}</p>
        <Button className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
          <IconPlus className="mr-2 h-4 w-4" />
          {t.common.create()}
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map(() => (
        <Skeleton key={generateUUID()} className="h-[220px] w-full rounded-3xl" />
      ))}
    </div>
  )
}
