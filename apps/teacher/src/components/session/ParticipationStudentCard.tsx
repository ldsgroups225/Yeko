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
        `
          bg-card/80 cursor-pointer overflow-hidden rounded-xl border shadow-sm
          backdrop-blur-sm transition-all
        `,
        hasParticipated
          ? `
            bg-primary/10 border-primary/30
            hover:bg-primary/15
          `
          : `
            border-border/50
            hover:bg-muted/50
          `,
      )}
      onClick={onToggleParticipation}
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
            {/* Participation indicator */}
            {hasParticipated && (
              <div className="
                border-card bg-primary absolute -right-1 -bottom-1 flex h-5 w-5
                items-center justify-center rounded-full border-2
              "
              >
                <IconCheck className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          {comment && (
            <Badge variant="outline" className="bg-muted/50 text-[10px]">
              <IconMessage className="mr-1 h-3 w-3" />
              Note
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="
              hover:bg-primary/10
              h-8 w-8 rounded-lg
            "
            onClick={(e) => {
              e.stopPropagation()
              onComment()
            }}
          >
            <IconMessage className="text-muted-foreground h-4 w-4" />
          </Button>
          <div
            className={cn(
              `
                flex h-10 w-10 items-center justify-center rounded-xl
                transition-all
              `,
              hasParticipated
                ? 'bg-primary text-white'
                : 'bg-muted/50 border-border/50 border',
            )}
          >
            <IconCheck className={cn('h-5 w-5', !hasParticipated && `
              text-muted-foreground/50
            `)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
