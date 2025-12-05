import { createFileRoute } from '@tanstack/react-router'
import { AssignmentMatrix } from '@/components/academic/assignment-matrix'
import { TeacherWorkload } from '@/components/academic/teacher-workload'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/_auth/app/academic/assignments')({
  component: AssignmentsPage,
})

function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Académique', href: '/app/academic/classes' },
          { label: 'Affectations' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Affectations enseignants</h1>
        <p className="text-muted-foreground">Gérer les affectations enseignant-matière par classe</p>
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Matrice d'affectation</TabsTrigger>
          <TabsTrigger value="workload">Charge de travail</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <AssignmentMatrix />
        </TabsContent>

        <TabsContent value="workload">
          <TeacherWorkload />
        </TabsContent>
      </Tabs>
    </div>
  )
}
