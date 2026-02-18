import { IconCheck, IconMessage } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { m as motion } from 'motion/react'

interface ParticipationStudentCardProps {
  student: {
    id: string
    firstName: string
    lastName: string
    matricule: string
    photoUrl: string | null
  }
  hasParticipated: boolean
  comment?: string
  onToggleParticipation: () => void
  onComment: () => void
}

export function ParticipationStudentCard({
  student,
  hasParticipated,
  comment,
  onToggleParticipation,
  onComment,
}: ParticipationStudentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'overflow-hidden rounded-xl border bg-card/80 shadow-sm backdrop-blur-sm transition-all cursor-pointer',
        hasParticipated
          ? 'bg-primary/10 border-primary/30 hover:bg-primary/15'
          : 'border-border/50 hover:bg-muted/50',
      )}
      onClick={onToggleParticipation}
    >
      <div className="w-full p-4 flex items-center justify-between gap-3">
        {/* Student Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-border/50 shrink-0">
              <AvatarImage src={student.photoUrl ?? undefined} alt={`${student.firstName} ${student.lastName}`} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {student.firstName[0]}
                {student.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {/* Participation indicator */}
            {hasParticipated && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-card bg-primary">
                <IconCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground text-sm">
              {student.lastName}
              {' '}
              {student.firstName}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
              {student.matricule}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {comment && (
            <Badge variant="outline" className="text-[10px] bg-muted/50">
              <IconMessage className="w-3 h-3 mr-1" />
              Note
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation()
              onComment()
            }}
          >
            <IconMessage className="w-4 h-4 text-muted-foreground" />
          </Button>
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              hasParticipated
                ? 'bg-primary text-white'
                : 'bg-muted/50 border border-border/50',
            )}
          >
            <IconCheck className={cn('w-5 h-5', !hasParticipated && 'text-muted-foreground/50')} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
