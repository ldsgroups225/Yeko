import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TeacherForm } from '@/components/hr/teachers/teacher-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { getTeacher } from '@/school/functions/teachers'

export const Route = createFileRoute('/_auth/users/teachers/$teacherId/edit')({
  component: EditTeacherPage,
})

function EditTeacherPage() {
  const { teacherId } = Route.useParams()
  const t = useTranslations()
  const navigate = useNavigate()

  const { data: teacherResult, isPending } = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: async () => {
      const result = await getTeacher({ data: teacherId })
      return result
    },
  })

  const teacher = teacherResult?.success ? teacherResult.data : null

  const handleSuccess = () => {
    navigate({ to: `/users/teachers/${teacherId}` })
  }

  if (isPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="
            border-primary h-8 w-8 animate-spin rounded-full border-4
            border-t-transparent
          "
          />
          <p className="text-muted-foreground mt-4 text-sm">{t.common.loading()}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.hr.title(), href: '/users' },
          { label: t.hr.teachers.title(), href: '/users/teachers' },
          {
            label: teacher?.specialization || teacherId,
            href: `/users/teachers/${teacherId}`,
          },
          { label: t.hr.teachers.editTeacher() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.hr.teachers.editTeacher()}</h1>
        <p className="text-muted-foreground">{t.hr.teachers.editTeacherDescription()}</p>
      </div>

      {teacher && (
        <TeacherForm
          teacher={{
            ...teacher,
            subjectIds: teacher.subjects.map(s => s.subjectId),
            hireDate: teacher.hireDate ? new Date(teacher.hireDate) : undefined,
            specialization: teacher.specialization ?? undefined,
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
