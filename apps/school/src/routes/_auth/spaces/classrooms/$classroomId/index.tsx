import {
  IconBuilding,
  IconEdit,
  IconMapPin,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import {
  deleteClassroom,
  getClassroomById,
} from '@/school/functions/classrooms'

export const Route = createFileRoute('/_auth/spaces/classrooms/$classroomId/')({
  component: ClassroomDetailPage,
})

function ClassroomDetailPage() {
  const t = useTranslations()
  const { classroomId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: result, isPending } = useQuery({
    queryKey: ['classroom', classroomId],
    queryFn: () => getClassroomById({ data: classroomId }),
  })
  const data = result?.success ? result.data : null

  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.classrooms.delete,
    mutationFn: () => deleteClassroom({ data: classroomId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      toast.success(t.common.deleteSuccess())
      navigate({ to: '/spaces/classrooms' })
    },
    onError: (error) => {
      toast.error(error.message || t.errors.generic())
    },
  })

  if (isPending) {
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
          <p className="text-lg font-medium text-muted-foreground">
            {t.spaces.classroom.notFound()}
          </p>
          <Button
            render={(
              <Link to="/spaces/classrooms">
                {t.spaces.classroom.backToList()}
              </Link>
            )}
            className="mt-4 rounded-xl shadow-lg shadow-primary/20"
          />
        </div>
      </div>
    )
  }

  const { classroom, assignedClasses } = data

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.spaces(), href: '/spaces/classrooms' },
          { label: t.nav.classrooms(), href: '/spaces/classrooms' },
          { label: classroom.name },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <IconBuilding className="size-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase italic">
              {classroom.name}
            </h1>
            <p className="text-lg font-medium text-muted-foreground italic">
              {classroom.code}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="rounded-xl h-10 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            {t.common.delete()}
          </Button>
          <Button
            size="sm"
            onClick={() =>
              navigate({
                to: '/spaces/classrooms/$classroomId/edit',
                params: { classroomId },
              })}
            className="rounded-xl h-10 shadow-lg shadow-primary/20"
          >
            <IconEdit className="mr-2 h-4 w-4" />
            {t.common.edit()}
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-muted/20 backdrop-blur-md border border-border/40 p-1 rounded-2xl w-full sm:w-auto inline-flex gap-1">
          <TabsTrigger
            value="info"
            className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-xl data-[state=active]:shadow-primary/5"
          >
            {t.spaces.classroom.tabs.info()}
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-xl data-[state=active]:shadow-primary/5"
          >
            {t.spaces.classroom.tabs.classes()}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="border-b border-border/40 bg-muted/5">
                <CardTitle className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
                  {t.spaces.classroom.details()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t.spaces.classroom.status()}
                  </span>
                  <Badge
                    variant={
                      classroom.status === 'active' ? 'default' : 'secondary'
                    }
                    className="capitalize"
                  >
                    {classroom.status === 'active'
                      ? t.spaces.classroom.statusActive()
                      : classroom.status === 'maintenance'
                        ? t.spaces.classroom.statusMaintenance()
                        : t.spaces.classroom.statusInactive()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t.spaces.classroom.type()}
                  </span>
                  <span className="capitalize font-bold">{classroom.type}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t.spaces.classroom.capacity()}
                  </span>
                  <span className="flex items-center gap-2 font-bold">
                    <IconUsers className="h-4 w-4 text-muted-foreground" />
                    {classroom.capacity}
                    {' '}
                    <span className="text-xs font-normal text-muted-foreground">
                      {t.students.title().toLowerCase()}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="border-b border-border/40 bg-muted/5">
                <CardTitle className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
                  {t.spaces.classroom.location()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t.spaces.classroom.building()}
                  </span>
                  <span className="flex items-center gap-2 font-bold">
                    <IconMapPin className="h-4 w-4 text-muted-foreground" />
                    {classroom.building || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t.spaces.classrooms.floor()}
                  </span>
                  <span className="font-bold">{classroom.floor || '-'}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {classroom.equipment
            && Object.keys(classroom.equipment).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="border-b border-border/40 bg-muted/5">
                  <CardTitle className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
                    {t.spaces.classroom.equipment()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-3">
                    {classroom.equipment.projector && (
                      <Badge
                        variant="outline"
                        className="px-3 py-1 rounded-lg text-sm bg-primary/5 border-primary/20 text-primary"
                      >
                        {t.spaces.classroom.projector()}
                      </Badge>
                    )}
                    {classroom.equipment.whiteboard && (
                      <Badge
                        variant="outline"
                        className="px-3 py-1 rounded-lg text-sm bg-primary/5 border-primary/20 text-primary"
                      >
                        {t.spaces.classroom.whiteboard()}
                      </Badge>
                    )}
                    {classroom.equipment.smartboard && (
                      <Badge
                        variant="outline"
                        className="px-3 py-1 rounded-lg text-sm bg-primary/5 border-primary/20 text-primary"
                      >
                        {t.spaces.classroom.smartboard()}
                      </Badge>
                    )}
                    {classroom.equipment.ac && (
                      <Badge
                        variant="outline"
                        className="px-3 py-1 rounded-lg text-sm bg-primary/5 border-primary/20 text-primary"
                      >
                        {t.spaces.classroom.ac()}
                      </Badge>
                    )}
                    {classroom.equipment.computers && (
                      <Badge
                        variant="outline"
                        className="px-3 py-1 rounded-lg text-sm bg-primary/5 border-primary/20 text-primary"
                      >
                        {classroom.equipment.computers}
                        {' '}
                        {t.spaces.classroom.computers().toLowerCase()}
                      </Badge>
                    )}
                    {classroom.equipment.other?.map((item: string) => (
                      <Badge
                        key={item}
                        variant="outline"
                        className="px-3 py-1 rounded-lg text-sm"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {classroom.notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="border-b border-border/40 bg-muted/5">
                  <CardTitle className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
                    {t.spaces.classroom.notes()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                    {classroom.notes}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="classes" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <CardHeader className="border-b border-border/40 bg-muted/5">
                <CardTitle className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
                  {t.spaces.classroom.assignedClasses()}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {assignedClasses && assignedClasses.length > 0
                  ? (
                      <div className="divide-y divide-border/40">
                        {assignedClasses.map((cls, index) => (
                          <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                          >
                            <span className="font-bold text-lg">
                              {cls.gradeName}
                              {' '}
                              <span className="font-normal text-muted-foreground">
                                {cls.seriesName}
                              </span>
                              {' '}
                              <span className="ml-2 px-2 py-0.5 rounded-md bg-muted/20 text-xs font-mono">
                                {cls.section}
                              </span>
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              render={(
                                <Link
                                  to="/classes/$classId"
                                  params={{ classId: cls.id }}
                                >
                                  {t.common.view()}
                                </Link>
                              )}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-medium"
                            />
                          </motion.div>
                        ))}
                      </div>
                    )
                  : (
                      <div className="p-12 text-center">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mb-4">
                          <IconUsers className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                          {t.spaces.classroom.noAssignedClasses()}
                        </p>
                      </div>
                    )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t.common.delete()}
        description={t.common.deleteConfirmDescription({
          name: classroom.name,
        })}
        confirmText={classroom.code}
        onConfirm={() => deleteMutation.mutate()}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
