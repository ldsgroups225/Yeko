import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Building2, Edit, MapPin, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { deleteClassroom, getClassroomById } from '@/school/functions/classrooms'

export const Route = createFileRoute('/_auth/app/spaces/classrooms/$classroomId/')({
  component: ClassroomDetailPage,
})

function ClassroomDetailPage() {
  const { classroomId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['classroom', classroomId],
    queryFn: () => getClassroomById({ data: classroomId }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteClassroom({ data: classroomId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      toast.success('Salle supprimée')
      navigate({ to: '/app/spaces/classrooms' })
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

  if (!data?.classroom) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Salle non trouvée</p>
          <Button asChild className="mt-4">
            <Link to="/app/spaces/classrooms">Retour</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { classroom, assignedClasses } = data

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Espaces', href: '/app/spaces/classrooms' },
          { label: 'Salles de classe', href: '/app/spaces/classrooms' },
          { label: classroom.name },
        ]}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{classroom.name}</h1>
            <p className="text-muted-foreground">{classroom.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
          <Button
            size="sm"
            onClick={() => navigate({ to: '/app/spaces/classrooms/$classroomId/edit', params: { classroomId } })}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="classes">Classes assignées</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <Badge variant={classroom.status === 'active' ? 'default' : 'secondary'}>
                    {classroom.status === 'active' ? 'Actif' : classroom.status === 'maintenance' ? 'Maintenance' : 'Inactif'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">{classroom.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Capacité</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {classroom.capacity}
                    {' '}
                    élèves
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Localisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bâtiment</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {classroom.building || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Étage</span>
                  <span>{classroom.floor || '-'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {classroom.equipment && Object.keys(classroom.equipment).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Équipements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {classroom.equipment.projector && <Badge variant="outline">Projecteur</Badge>}
                  {classroom.equipment.whiteboard && <Badge variant="outline">Tableau blanc</Badge>}
                  {classroom.equipment.smartboard && <Badge variant="outline">Tableau interactif</Badge>}
                  {classroom.equipment.ac && <Badge variant="outline">Climatisation</Badge>}
                  {classroom.equipment.computers && (
                    <Badge variant="outline">
                      {classroom.equipment.computers}
                      {' '}
                      ordinateurs
                    </Badge>
                  )}
                  {classroom.equipment.other?.map((item: string) => (
                    <Badge key={item} variant="outline">{item}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {classroom.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{classroom.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Classes utilisant cette salle</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedClasses && assignedClasses.length > 0
                ? (
                    <div className="space-y-2">
                      {assignedClasses.map((cls: any) => (
                        <div key={cls.id} className="flex items-center justify-between rounded-md border p-3">
                          <span className="font-medium">
                            {cls.gradeName}
                            {' '}
                            {cls.seriesName}
                            {' '}
                            {cls.section}
                          </span>
                          <Link
                            to="/app/academic/classes/$classId"
                            params={{ classId: cls.id }}
                            className="text-sm text-primary hover:underline"
                          >
                            Voir
                          </Link>
                        </div>
                      ))}
                    </div>
                  )
                : (
                    <p className="text-sm text-muted-foreground">Aucune classe assignée à cette salle.</p>
                  )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Supprimer la salle"
        description="Cette action est irréversible. La salle sera définitivement supprimée."
        confirmText={classroom.code}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
