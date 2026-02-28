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
  isPending?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ConductRecordList({
  records,
  isPending,
  onView,
  onEdit,
  onDelete,
}: ConductRecordListProps) {
  const t = useTranslations()

  if (isPending) {
    return <ConductRecordListSkeleton />
  }

  if (records.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          border-border/60 bg-card/20 flex flex-col items-center rounded-3xl
          border border-dashed p-12 text-center backdrop-blur-sm
        "
      >
        <div className="bg-background/50 mb-6 rounded-full p-6 shadow-inner">
          <IconFileAlert className="text-muted-foreground/20 size-12" />
        </div>
        <h3 className="text-muted-foreground mb-2 text-xl font-bold">{t.conduct.noRecords()}</h3>
        <p className="text-muted-foreground mb-8 max-w-xs text-sm">{t.conduct.noRecordsDescription()}</p>
        <Button className="
          h-12 rounded-2xl px-8 text-[10px] font-black tracking-widest uppercase
        "
        >
          <IconPlus className="mr-2 h-4 w-4" />
          {t.common.create()}
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="
      grid gap-6
      md:grid-cols-2
      lg:grid-cols-3
    "
    >
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
    <div className="
      grid gap-6
      md:grid-cols-2
      lg:grid-cols-3
    "
    >
      {Array.from({ length: 6 }).map(() => (
        <Skeleton key={generateUUID()} className="h-[220px] w-full rounded-3xl" />
      ))}
    </div>
  )
}
