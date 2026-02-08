import { IconCalendar, IconDots, IconMapPin } from '@tabler/icons-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { ConductSeverityBadge } from './conduct-severity-badge'
import { ConductStatusBadge } from './conduct-status-badge'
import { ConductTypeBadge } from './conduct-type-badge'

type ConductType = 'incident' | 'sanction' | 'reward' | 'note'
type ConductSeverity = 'low' | 'medium' | 'high' | 'critical'
type ConductStatus
  = | 'open'
    | 'investigating'
    | 'pending_decision'
    | 'resolved'
    | 'closed'
    | 'appealed'

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
  className?: string
}

export function ConductRecordCard({
  record,
  onView,
  onEdit,
  onDelete,
  className,
}: ConductRecordCardProps) {
  const t = useTranslations()

  const initials = record.studentName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          'group overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl transition-all hover:bg-card/50 hover:shadow-primary/5',
          className,
        )}
      >

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <AvatarImage
                  src={record.studentPhoto ?? undefined}
                  alt={record.studentName}
                />
                <AvatarFallback className="bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-background flex items-center justify-center">
                <div
                  className={cn(
                    'h-1.5 w-1.5 rounded-full animate-pulse',
                    record.type === 'reward'
                      ? 'bg-emerald-500'
                      : record.type === 'incident'
                        ? 'bg-orange-500'
                        : record.type === 'sanction'
                          ? 'bg-red-500'
                          : 'bg-blue-500',
                  )}
                />
              </div>
            </div>
            <div>
              <div className="font-black tracking-tight text-lg leading-none mb-1">
                {record.studentName}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {record.title}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  <IconDots className="h-5 w-5" />
                </Button>
              )}
            />
            <DropdownMenuContent
              align="end"
              className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40"
            >
              {onView && (
                <DropdownMenuItem
                  onClick={() => onView(record.id)}
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                >
                  {t.common.view()}
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(record.id)}
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                >
                  {t.common.edit()}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(record.id)}
                  className="rounded-xl text-destructive focus:text-destructive font-bold uppercase tracking-widest text-[10px]"
                >
                  {t.common.delete()}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground/70 leading-relaxed italic line-clamp-2">
            "
            {record.description}
            "
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <ConductTypeBadge type={record.type} />
            {record.severity && (
              <ConductSeverityBadge severity={record.severity} />
            )}
            <ConductStatusBadge status={record.status} />
          </div>

          <div className="flex items-center gap-6 pt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 border-t border-border/10 mt-auto">
            {record.incidentDate && (
              <div className="flex items-center gap-2">
                <IconCalendar className="h-3.5 w-3.5 text-primary/40" />
                {new Date(record.incidentDate).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            )}
            {record.location && (
              <div className="flex items-center gap-2">
                <IconMapPin className="h-3.5 w-3.5 text-primary/40" />
                {record.location}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
