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
          `
            group border-border/40 bg-card/30
            hover:bg-card/50 hover:shadow-primary/5
            overflow-hidden rounded-3xl shadow-xl backdrop-blur-xl
            transition-all
          `,
          className,
        )}
      >

        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-4
        "
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="
                border-primary/20 h-12 w-12 border-2 shadow-inner
                transition-transform duration-500
                group-hover:scale-110
              "
              >
                <AvatarImage
                  src={record.studentPhoto ?? undefined}
                  alt={record.studentName}
                />
                <AvatarFallback className="
                  bg-primary/5 text-primary text-[10px] font-black
                  tracking-widest uppercase
                "
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="
                border-card bg-background absolute -right-1 -bottom-1 flex h-4
                w-4 items-center justify-center rounded-full border-2
              "
              >
                <div
                  className={cn(
                    'h-1.5 w-1.5 animate-pulse rounded-full',
                    record.type === 'reward'
                      ? 'bg-success'
                      : record.type === 'incident'
                        ? 'bg-accent'
                        : record.type === 'sanction'
                          ? 'bg-destructive'
                          : 'bg-secondary',
                  )}
                />
              </div>
            </div>
            <div>
              <div className="
                mb-1 text-lg leading-none font-black tracking-tight
              "
              >
                {record.studentName}
              </div>
              <div className="
                text-muted-foreground/60 text-[10px] font-black tracking-widest
                uppercase
              "
              >
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
                  className="
                    hover:bg-primary/10 hover:text-primary
                    rounded-xl transition-colors
                  "
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
              className="
                bg-popover/90 border-border/40 rounded-2xl backdrop-blur-2xl
              "
            >
              {onView && (
                <DropdownMenuItem
                  onClick={() => onView(record.id)}
                  className="
                    rounded-xl text-[10px] font-bold tracking-widest uppercase
                  "
                >
                  {t.common.view()}
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(record.id)}
                  className="
                    rounded-xl text-[10px] font-bold tracking-widest uppercase
                  "
                >
                  {t.common.edit()}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(record.id)}
                  className="
                    text-destructive
                    focus:text-destructive
                    rounded-xl text-[10px] font-bold tracking-widest uppercase
                  "
                >
                  {t.common.delete()}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="
            text-muted-foreground/70 line-clamp-2 text-sm leading-relaxed
            font-medium italic
          "
          >
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

          <div className="
            text-muted-foreground/40 border-border/10 mt-auto flex items-center
            gap-6 border-t pt-2 text-[10px] font-black tracking-widest uppercase
          "
          >
            {record.incidentDate && (
              <div className="flex items-center gap-2">
                <IconCalendar className="text-primary/40 h-3.5 w-3.5" />
                {new Date(record.incidentDate).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            )}
            {record.location && (
              <div className="flex items-center gap-2">
                <IconMapPin className="text-primary/40 h-3.5 w-3.5" />
                {record.location}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
