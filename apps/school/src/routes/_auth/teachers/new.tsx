import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TeacherForm } from '@/components/hr/teachers/teacher-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/teachers/new')({
  component: NewTeacherPage,
})

function NewTeacherPage() {
  const t = useTranslations()
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate({ to: '/teachers', search: { page: 1 } })
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.teachers(), href: '/teachers' },
          { label: t.hr.teachers.title(), href: '/teachers' },
          { label: t.hr.teachers.addTeacher() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.hr.teachers.addTeacher()}</h1>
        <p className="text-muted-foreground">{t.hr.teachers.addTeacherDescription()}</p>
      </div>

      <TeacherForm onSuccess={handleSuccess} />
    </div>
  )
}
