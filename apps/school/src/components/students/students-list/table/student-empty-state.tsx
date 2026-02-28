import { IconPlus, IconUsers } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'

export function StudentEmptyState() {
  const t = useTranslations()
  const navigate = useNavigate()

  return (
    <div className="
      border-border/20 bg-card/10 flex min-h-[300px] flex-col items-center
      justify-center rounded-xl border border-dashed p-8 text-center
      backdrop-blur-sm
    "
    >
      <IconUsers className="text-muted-foreground/50 mx-auto h-12 w-12" />
      <h3 className="mt-4 text-lg font-semibold">{t.students.noStudents()}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        {t.students.noStudentsDescription()}
      </p>
      <Button onClick={() => navigate({ to: '/students/new' })} className="mt-6">
        <IconPlus className="mr-2 h-4 w-4" />
        {t.students.addStudent()}
      </Button>
    </div>
  )
}
