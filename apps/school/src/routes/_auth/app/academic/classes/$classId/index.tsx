import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Edit, GraduationCap, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { deleteClass, getClassById } from '@/school/functions/classes'

export const Route = createFileRoute('/_auth/app/academic/classes/$classId/')({
  component: ClassDetailPage,
})

function ClassDetailPage() {
  const { classId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => getClassById({ data: classId }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteClass({ data: classId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success('Classe supprimée')
      navigate({ to: '/app/academic/classes' })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression')
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data?.class) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Classe non trouvée</p>
          <Button asChild className="mt-4">
            <Link to="/app/academic/classes">Retour</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { class: classData, grade, series, classroom, homeroomTeacher, studentsCount, boysCount, girlsCount } = data
  const className = `${grade.name} ${series?.name || ''} ${classData.section}`.trim()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Académique', href: '/app/academic/classes' },
          { label: 'Classes', href: '/app/academic/classes' },
          { label: className },
        ]}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{className}</h1>
            {classroom && <p className="text-muted-foreground">{classroom.name}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
          <Button
            size="sm"
            onClick={() => navigate({ to: '/app/academic/classes/$classId/edit', params: { classId } })}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="students">Élèves</TabsTrigger>
          <TabsTrigger value="teachers">Enseignants</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Élèves</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{studentsCount}</span>
                  <span className="text-muted-foreground">
                    /
                    {classData.maxStudents}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {boysCount}
                  {' '}
                  garçons,
                  {girlsCount}
                  {' '}
                  filles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Statut</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={classData.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                  {classData.status === 'active' ? 'Active' : 'Archivée'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Salle</CardTitle>
              </CardHeader>
              <CardContent>
                {classroom
                  ? (
                      <Link
                        to="/app/spaces/classrooms/$classroomId"
                        params={{ classroomId: classroom.id }}
                        className="text-primary hover:underline"
                      >
                        {classroom.name}
                      </Link>
                    )
                  : (
                      <span className="text-muted-foreground">Non assignée</span>
                    )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Niveau</p>
                  <p className="font-medium">{grade.name}</p>
                </div>
                {series && (
                  <div>
                    <p className="text-sm text-muted-foreground">Série</p>
                    <p className="font-medium">{series.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-medium">{classData.section}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Professeur principal</p>
                  <p className="font-medium">{homeroomTeacher?.name || 'Non assigné'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Élèves inscrits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {studentsCount > 0
                  ? `${studentsCount} élève(s) inscrit(s) dans cette classe.`
                  : 'Aucun élève inscrit dans cette classe.'}
              </p>
              {/* TODO: Add student list when enrollment module is ready */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enseignants par matière</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Les affectations enseignant-matière pour cette classe.
              </p>
              <Link
                to="/app/academic/classes"
                className="text-primary hover:underline text-sm"
              >
                Voir la matrice d'affectation complète →
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Supprimer la classe"
        description="Cette action est irréversible. La classe sera définitivement supprimée."
        confirmText={className}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
