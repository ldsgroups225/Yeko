import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

import { StudentForm } from '@/components/students'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from '@/i18n'
import { studentsOptions } from '@/lib/queries/students'

export const Route = createFileRoute('/_auth/students/$studentId/edit')({
  component: EditStudentPage,
})

function EditStudentPage() {
  const t = useTranslations()
  const { studentId } = Route.useParams()
  const { data, isLoading } = useQuery(studentsOptions.detail(studentId))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t.students.notFound()}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.students.title(), href: '/students' },
          { label: `${data.student.lastName} ${data.student.firstName}`, href: `/students/${studentId}` },
          { label: t.common.edit() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.students.editStudent()}</h1>
        <p className="text-muted-foreground">{t.students.editStudentDescription()}</p>
      </div>

      <StudentForm mode="edit" student={data.student} />
    </div>
  )
}
