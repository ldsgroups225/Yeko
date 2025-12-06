import { createFileRoute } from '@tanstack/react-router'

import { TeacherAssignmentList } from '@/components/academic/assignments/teacher-assignment-list'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export const Route = createFileRoute('/_auth/app/academic/assignments')({
  component: AssignmentsPage,
})

function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Académique', href: '/app/academic' },
          { label: 'Affectations' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Affectations des enseignants</h1>
        <p className="text-muted-foreground">Gérer les affectations des matières aux enseignants</p>
      </div>

      <TeacherAssignmentList />
    </div>
  )
}
