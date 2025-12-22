import { Link } from '@tanstack/react-router'
import { Book, Building2, User } from 'lucide-react'
import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from '@/i18n'

interface TeacherClassesProps {
  classes: any[]
  isLoading?: boolean
}

export function TeacherClasses({ classes, isLoading }: TeacherClassesProps) {
  const t = useTranslations()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {['skeleton-1', 'skeleton-2', 'skeleton-3'].map(key => (
          <div key={key} className="h-32 animate-pulse rounded-2xl bg-card/40 border border-border/40" />
        ))}
      </div>
    )
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-card/40 rounded-2xl border border-dashed border-border/40 backdrop-blur-sm">
        <Building2 className="mb-4 size-12 text-muted-foreground/40" />
        <h3 className="text-lg font-semibold">{t.hr.teachers.noClasses()}</h3>
        <p className="text-sm text-muted-foreground">Cet enseignant n'a pas encore de classes assignées.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls, index) => (
        <motion.div
          key={cls.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-5 shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:border-primary/20"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Link
                to="/classes/$classId"
                params={{ classId: cls.id }}
                className="text-lg font-bold tracking-tight hover:text-primary transition-colors"
              >
                {cls.gradeName}
                {' '}
                {cls.section}
                {cls.seriesName && (
                  <span className="ml-1 text-sm font-medium text-muted-foreground">
                    (
                    {cls.seriesName}
                    )
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="size-3.5" />
                <span>{cls.classroomName || 'N/A'}</span>
              </div>
            </div>
            {cls.isHomeroom && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-wider">
                <User className="mr-1 size-3" />
                Titulaire
              </Badge>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {cls.subjects?.map((subject: string) => (
              <Badge
                key={subject}
                variant="secondary"
                className="bg-secondary/30 text-xs font-medium px-2 py-0"
              >
                <Book className="mr-1 size-3 opacity-60" />
                {subject}
              </Badge>
            ))}
          </div>

          <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              to="/classes/$classId"
              params={{ classId: cls.id }}
              className="text-xs font-semibold text-primary/80 hover:text-primary"
            >
              Voir détails →
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
