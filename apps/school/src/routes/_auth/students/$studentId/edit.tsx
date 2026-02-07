import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { StudentForm } from '@/components/students'
import { useTranslations } from '@/i18n'
import { studentsOptions } from '@/lib/queries/students'

export const Route = createFileRoute('/_auth/students/$studentId/edit')({
  component: EditStudentPage,
})

function EditStudentPage() {
  const t = useTranslations()
  const { studentId } = Route.useParams()
  const { data, isPending } = useQuery(studentsOptions.detail(studentId))

  if (isPending) {
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
          { label: `${data.lastName} ${data.firstName}`, href: `/students/${studentId}` },
          { label: t.common.edit() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.students.editStudent()}</h1>
        <p className="text-muted-foreground">{t.students.editStudentDescription()}</p>
      </div>

      <StudentForm
        mode="edit"
        student={{
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.dob,
          gender: data.gender ?? undefined,
          photoUrl: data.photoUrl ?? undefined,
          matricule: data.matricule ?? undefined,
          birthPlace: data.birthPlace ?? undefined,
          nationality: data.nationality ?? undefined,
          address: data.address ?? undefined,
          emergencyContact: data.emergencyContact ?? undefined,
          emergencyPhone: data.emergencyPhone ?? undefined,
          bloodType: data.bloodType ?? undefined,
          medicalNotes: data.medicalNotes ?? undefined,
          previousSchool: data.previousSchool ?? undefined,
          admissionDate: data.admissionDate ?? undefined,
        }}
      />
    </div>
  )
}
