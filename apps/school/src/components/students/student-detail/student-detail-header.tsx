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
    <div className="
      border-border/20 from-primary/10 via-background/50 to-background/80
      dark:from-primary/10 dark:via-card/50 dark:to-card/80
      relative overflow-hidden rounded-3xl border bg-linear-to-br p-8
      backdrop-blur-2xl
    "
    >
      <div className="
        bg-primary/20 absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64
        rounded-full opacity-50 blur-3xl
      "
      />

      <div className="
        relative z-10 flex flex-col items-center gap-6
        md:flex-row md:items-start md:justify-between
      "
      >
        <div className="
          flex flex-col items-center gap-6
          md:flex-row
        "
        >
          <button
            type="button"
            onClick={onEditPhoto}
            className="group relative cursor-pointer"
            title={t.students.changePhoto()}
          >
            <div className="
              dark:border-border/10
              relative h-28 w-28 overflow-hidden rounded-full border-4
              border-white
            "
            >
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={student.photoUrl ?? undefined}
                  className="object-cover"
                />
                <AvatarFallback className="
                  bg-primary/10 text-primary text-3xl font-bold
                "
                >
                  {student.firstName?.[0] || '?'}
                  {student.lastName?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="
                absolute inset-0 flex items-center justify-center bg-black/40
                opacity-0 transition-opacity duration-300
                group-hover:opacity-100
              "
              >
                <IconEdit className="h-8 w-8 text-white drop-shadow-md" />
              </div>
            </div>
          </button>

          <div className="
            space-y-2 text-center
            md:text-left
          "
          >
            <h1 className="text-foreground text-4xl font-bold tracking-tight">
              {student.lastName}
              {' '}
              <span className="text-muted-foreground font-light">
                {student.firstName}
              </span>
            </h1>
            <div className="
              flex flex-wrap items-center justify-center gap-3
              md:justify-start
            "
            >
              <Badge
                variant="outline"
                className="
                  dark:bg-card/20
                  bg-white/50 px-3 py-1 font-mono text-sm tracking-widest
                  uppercase
                "
              >
                {student.matricule}
              </Badge>
              <Badge
                className={`
                  ${statusColors[student.status as keyof typeof statusColors]}
                  border-0 px-3 py-1 text-sm shadow-none
                `}
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
          className="
            rounded-full shadow-sm
            hover:shadow-md
          "
        />
      </div>
    </div>
  )
}
