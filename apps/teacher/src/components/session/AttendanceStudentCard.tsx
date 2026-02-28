import type { AttendanceStatus } from '@/hooks/use-attendance-records'
import { IconCheck, IconClock, IconX } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { m as motion } from 'motion/react'
import { useI18nContext } from '@/i18n/i18n-react'

interface AttendanceStudentCardProps {
  student: {
    id: string
    firstName: string
    lastName: string
    matricule: string
    photoUrl: string | null
  }
  status: AttendanceStatus
  onUpdateStatus: (studentId: string, status: AttendanceStatus) => void
  isLateMode?: boolean
}

const statusConfig = {
  present: {
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    icon: IconCheck,
    iconColor: 'text-emerald-500',
  },
  absent: {
    bg: 'bg-red-500/10 border-red-500/30',
    icon: IconX,
    iconColor: 'text-red-500',
  },
  late: {
    bg: 'bg-accent/10 border-accent/30',
    icon: IconClock,
    iconColor: 'text-accent',
  },
}

export function AttendanceStudentCard({
  student,
  status,
  onUpdateStatus,
  isLateMode = false,
}: AttendanceStudentCardProps) {
  const { LL } = useI18nContext()
  const config = statusConfig[status]
  const StatusIcon = config.icon

  // In late mode, only show absent students who might arrive late
  if (isLateMode && status === 'present') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        `
          bg-card/80 overflow-hidden rounded-xl border shadow-sm
          backdrop-blur-sm transition-all
        `,
        config.bg,
      )}
    >
      <div className="flex w-full items-center justify-between gap-3 p-4">
        {/* Student Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative">
            <Avatar className="border-border/50 h-10 w-10 shrink-0 border">
              <AvatarImage src={student.photoUrl ?? undefined} alt={`${student.firstName} ${student.lastName}`} />
              <AvatarFallback className="
                bg-primary/10 text-primary text-xs font-bold
              "
              >
                {student.firstName[0]}
                {student.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {/* Status indicator */}
            <div className={cn(
              `
                border-card absolute -right-1 -bottom-1 flex h-5 w-5
                items-center justify-center rounded-full border-2
              `,
              status === 'present' && 'bg-emerald-500',
              status === 'absent' && 'bg-red-500',
              status === 'late' && 'bg-accent',
            )}
            >
              <StatusIcon className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-foreground truncate text-sm font-semibold">
              {student.lastName}
              {' '}
              {student.firstName}
            </h3>
            <p className="
              text-muted-foreground text-[10px] font-medium tracking-tighter
              uppercase
            "
            >
              {student.matricule}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {isLateMode
            ? (
                // Late mode: only show "Arrived Late" button
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-9 rounded-lg px-3 font-semibold transition-all',
                    status === 'late'
                      ? `
                        bg-accent border-accent
                        hover:bg-accent
                        text-white
                      `
                      : `
                        bg-muted/50
                        hover:bg-accent/20 hover:border-accent/50
                      `,
                  )}
                  onClick={() => onUpdateStatus(student.id, status === 'late' ? 'absent' : 'late')}
                >
                  <IconClock className="mr-1.5 h-4 w-4" />
                  {LL.session.late()}
                </Button>
              )
            : (
                // Initial attendance mode: show all three buttons
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-9 w-9 rounded-lg transition-all',
                      status === 'present'
                        ? `
                          bg-emerald-500 text-white
                          hover:bg-emerald-600
                        `
                        : `
                          bg-muted/50
                          hover:bg-emerald-500/20
                        `,
                    )}
                    onClick={() => onUpdateStatus(student.id, 'present')}
                    title={LL.attendance.status.present()}
                  >
                    <IconCheck className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-9 w-9 rounded-lg transition-all',
                      status === 'absent'
                        ? `
                          bg-red-500 text-white
                          hover:bg-red-600
                        `
                        : `
                          bg-muted/50
                          hover:bg-red-500/20
                        `,
                    )}
                    onClick={() => onUpdateStatus(student.id, 'absent')}
                    title={LL.attendance.status.absent()}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-9 w-9 rounded-lg transition-all',
                      status === 'late'
                        ? `
                          bg-accent
                          hover:bg-accent
                          text-white
                        `
                        : `
                          bg-muted/50
                          hover:bg-accent/20
                        `,
                    )}
                    onClick={() => onUpdateStatus(student.id, 'late')}
                    title={LL.attendance.status.late()}
                  >
                    <IconClock className="h-4 w-4" />
                  </Button>
                </>
              )}
        </div>
      </div>
    </motion.div>
  )
}
