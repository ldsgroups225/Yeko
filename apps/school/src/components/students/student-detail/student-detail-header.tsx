import { IconEdit } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'

const statusColors = {
  active: 'bg-success/10 text-success dark:bg-success/20 dark:text-success/80',
  graduated: 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary/80',
  transferred:
    'bg-accent/10 text-accent-foreground dark:bg-accent/20 dark:text-accent-foreground/80',
  withdrawn: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/80',
}

interface StudentDetailHeaderProps {
  student: any
  studentId: string
  onEditPhoto: () => void
}

export function StudentDetailHeader({ student, studentId, onEditPhoto }: StudentDetailHeaderProps) {
  const t = useTranslations()

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/20 bg-linear-to-br from-primary/10 via-background/50 to-background/80 p-8 backdrop-blur-2xl dark:from-primary/10 dark:via-card/50 dark:to-card/80">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl opacity-50" />

      <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <button
            type="button"
            onClick={onEditPhoto}
            className="group relative cursor-pointer"
            title={t.students.changePhoto()}
          >
            <div className="relative h-28 w-28 rounded-full border-4 border-white overflow-hidden dark:border-border/10">
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={student.photoUrl ?? undefined}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                  {student.firstName?.[0] || '?'}
                  {student.lastName?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <IconEdit className="h-8 w-8 text-white drop-shadow-md" />
              </div>
            </div>
          </button>

          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {student.lastName}
              {' '}
              <span className="font-light text-muted-foreground">
                {student.firstName}
              </span>
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 font-mono uppercase tracking-widest bg-white/50 dark:bg-card/20"
              >
                {student.matricule}
              </Badge>
              <Badge
                className={`${statusColors[student.status as keyof typeof statusColors]} border-0 px-3 py-1 text-sm shadow-none`}
              >
                {{
                  active: t.students.statusActive,
                  graduated: t.students.statusGraduated,
                  transferred: t.students.statusTransferred,
                  withdrawn: t.students.statusWithdrawn,
                }[
                  student.status as
                  | 'active'
                  | 'graduated'
                  | 'transferred'
                  | 'withdrawn'
                ]()}
              </Badge>
            </div>
          </div>
        </div>

        <Button
          render={(
            <Link to="/students/$studentId/edit" params={{ studentId }}>
              <IconEdit className="mr-2 h-4 w-4" />
              {t.common.edit()}
            </Link>
          )}
          size="lg"
          className="rounded-full shadow-sm hover:shadow-md"
        />
      </div>
    </div>
  )
}
