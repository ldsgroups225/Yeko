import { IconDeviceFloppy, IconLoader2, IconX } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'
import { useStudentForm } from './student-form-context'

export function StudentFormActions() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { state } = useStudentForm()
  const { mode, isPending } = state

  return (
    <div className="flex justify-end gap-3 sticky bottom-4 z-10 p-4 rounded-xl border border-border/20 bg-white/80 backdrop-blur-md shadow-sm dark:bg-card/80 dark:border-border/10">
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate({ to: '/students', search: { page: 1 } })}
        className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
      >
        <IconX className="mr-2 h-4 w-4" />
        {t.common.cancel()}
      </Button>
      <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all">
        {isPending ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : <IconDeviceFloppy className="mr-2 h-4 w-4" />}
        {mode === 'create' ? t.students.createStudent() : t.students.updateStudent()}
      </Button>
    </div>
  )
}
