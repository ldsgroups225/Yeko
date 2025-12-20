import { createFileRoute } from '@tanstack/react-router'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

import { StudentDetail } from '@/components/students'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/students/$studentId/')({
  component: StudentDetailPage,
})

function StudentDetailPage() {
  const t = useTranslations()
  const { studentId } = Route.useParams()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.students.title(), href: '/students' },
          { label: t.students.studentDetail() },
        ]}
      />

      <StudentDetail studentId={studentId} />
    </div>
  )
}
