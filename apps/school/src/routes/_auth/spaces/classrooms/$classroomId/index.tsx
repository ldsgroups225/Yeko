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
        <div className="
          border-primary h-8 w-8 animate-spin rounded-full border-4
          border-t-transparent
        "
        />
      </div>
    )
  }

  if (!data?.classroom) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg font-medium">
            {t.spaces.classroom.notFound()}
          </p>
          <Button
            render={(
              <Link to="/spaces/classrooms">
                {t.spaces.classroom.backToList()}
              </Link>
            )}
            className="shadow-primary/20 mt-4 rounded-xl shadow-lg"
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
          <div className="
            bg-primary/10 border-primary/20 rounded-2xl border p-4 shadow-lg
            backdrop-blur-xl
          "
          >
            <IconBuilding className="text-primary size-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase italic">
              {classroom.name}
            </h1>
            <p className="text-muted-foreground text-lg font-medium italic">
              {classroom.code}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="
              border-destructive/20 text-destructive
              hover:bg-destructive/10 hover:text-destructive
              hover:border-destructive/40
              h-10 rounded-xl transition-colors
            "
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
            className="shadow-primary/20 h-10 rounded-xl shadow-lg"
          >
            <IconEdit className="mr-2 h-4 w-4" />
            {t.common.edit()}
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="
          bg-muted/20 border-border/40 inline-flex w-full gap-1 rounded-2xl
          border p-1 backdrop-blur-md
          sm:w-auto
        "
        >
          <TabsTrigger
            value="info"
            className="
              data-[state=active]:bg-card data-[state=active]:shadow-primary/5
              rounded-xl
              data-[state=active]:shadow-xl
            "
          >
            {t.spaces.classroom.tabs.info()}
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="
              data-[state=active]:bg-card data-[state=active]:shadow-primary/5
              rounded-xl
              data-[state=active]:shadow-xl
            "
          >
            {t.spaces.classroom.tabs.classes()}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="
              grid gap-6
              md:grid-cols-2
            "
          >
            <Card className="
              border-border/40 bg-card/40 rounded-3xl border shadow-sm
              backdrop-blur-xl transition-all duration-300
              hover:shadow-md
            "
            >
              <CardHeader className="border-border/40 bg-muted/5 border-b">
                <CardTitle className="
                  text-muted-foreground text-lg font-bold tracking-wider
                  uppercase
                "
                >
                  {t.spaces.classroom.details()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="
                  bg-muted/10
                  hover:bg-muted/20
                  flex items-center justify-between rounded-xl p-3
                  transition-colors
                "
                >
                  <span className="text-muted-foreground text-sm font-medium">
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
                <div className="
                  bg-muted/10
                  hover:bg-muted/20
                  flex items-center justify-between rounded-xl p-3
                  transition-colors
                "
                >
                  <span className="text-muted-foreground text-sm font-medium">
                    {t.spaces.classroom.type()}
                  </span>
                  <span className="font-bold capitalize">{classroom.type}</span>
                </div>
                <div className="
                  bg-muted/10
                  hover:bg-muted/20
                  flex items-center justify-between rounded-xl p-3
                  transition-colors
                "
                >
                  <span className="text-muted-foreground text-sm font-medium">
                    {t.spaces.classroom.capacity()}
                  </span>
                  <span className="flex items-center gap-2 font-bold">
                    <IconUsers className="text-muted-foreground h-4 w-4" />
                    {classroom.capacity}
                    {' '}
                    <span className="text-muted-foreground text-xs font-normal">
                      {t.students.title().toLowerCase()}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="
              border-border/40 bg-card/40 rounded-3xl border shadow-sm
              backdrop-blur-xl transition-all duration-300
              hover:shadow-md
            "
            >
              <CardHeader className="border-border/40 bg-muted/5 border-b">
                <CardTitle className="
                  text-muted-foreground text-lg font-bold tracking-wider
                  uppercase
                "
                >
                  {t.spaces.classroom.location()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="
                  bg-muted/10
                  hover:bg-muted/20
                  flex items-center justify-between rounded-xl p-3
                  transition-colors
                "
                >
                  <span className="text-muted-foreground text-sm font-medium">
                    {t.spaces.classroom.building()}
                  </span>
                  <span className="flex items-center gap-2 font-bold">
                    <IconMapPin className="text-muted-foreground h-4 w-4" />
                    {classroom.building || '-'}
                  </span>
                </div>
                <div className="
                  bg-muted/10
                  hover:bg-muted/20
                  flex items-center justify-between rounded-xl p-3
                  transition-colors
                "
                >
                  <span className="text-muted-foreground text-sm font-medium">
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
              <Card className="
                border-border/40 bg-card/40 rounded-3xl border shadow-sm
                backdrop-blur-xl transition-all duration-300
                hover:shadow-md
              "
              >
                <CardHeader className="border-border/40 bg-muted/5 border-b">
                  <CardTitle className="
                    text-muted-foreground text-lg font-bold tracking-wider
                    uppercase
                  "
                  >
                    {t.spaces.classroom.equipment()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-3">
                    {classroom.equipment.projector && (
                      <Badge
                        variant="outline"
                        className="
                          bg-primary/5 border-primary/20 text-primary rounded-lg
                          px-3 py-1 text-sm
                        "
                      >
                        {t.spaces.classroom.projector()}
                      </Badge>
                    )}
                    {classroom.equipment.whiteboard && (
                      <Badge
                        variant="outline"
                        className="
                          bg-primary/5 border-primary/20 text-primary rounded-lg
                          px-3 py-1 text-sm
                        "
                      >
                        {t.spaces.classroom.whiteboard()}
                      </Badge>
                    )}
                    {classroom.equipment.smartboard && (
                      <Badge
                        variant="outline"
                        className="
                          bg-primary/5 border-primary/20 text-primary rounded-lg
                          px-3 py-1 text-sm
                        "
                      >
                        {t.spaces.classroom.smartboard()}
                      </Badge>
                    )}
                    {classroom.equipment.ac && (
                      <Badge
                        variant="outline"
                        className="
                          bg-primary/5 border-primary/20 text-primary rounded-lg
                          px-3 py-1 text-sm
                        "
                      >
                        {t.spaces.classroom.ac()}
                      </Badge>
                    )}
                    {classroom.equipment.computers && (
                      <Badge
                        variant="outline"
                        className="
                          bg-primary/5 border-primary/20 text-primary rounded-lg
                          px-3 py-1 text-sm
                        "
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
                        className="rounded-lg px-3 py-1 text-sm"
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
              <Card className="
                border-border/40 bg-card/40 rounded-3xl border shadow-sm
                backdrop-blur-xl transition-all duration-300
                hover:shadow-md
              "
              >
                <CardHeader className="border-border/40 bg-muted/5 border-b">
                  <CardTitle className="
                    text-muted-foreground text-lg font-bold tracking-wider
                    uppercase
                  "
                  >
                    {t.spaces.classroom.notes()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="
                    text-muted-foreground text-sm leading-relaxed font-medium
                    italic
                  "
                  >
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
            <Card className="
              border-border/40 bg-card/40 overflow-hidden rounded-3xl border
              shadow-sm backdrop-blur-xl transition-all duration-300
              hover:shadow-md
            "
            >
              <CardHeader className="border-border/40 bg-muted/5 border-b">
                <CardTitle className="
                  text-muted-foreground text-lg font-bold tracking-wider
                  uppercase
                "
                >
                  {t.spaces.classroom.assignedClasses()}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {assignedClasses && assignedClasses.length > 0
                  ? (
                      <div className="divide-border/40 divide-y">
                        {assignedClasses.map((cls, index) => (
                          <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="
                              hover:bg-muted/30
                              group flex items-center justify-between p-4
                              transition-colors
                            "
                          >
                            <span className="text-lg font-bold">
                              {cls.gradeName}
                              {' '}
                              <span className="
                                text-muted-foreground font-normal
                              "
                              >
                                {cls.seriesName}
                              </span>
                              {' '}
                              <span className="
                                bg-muted/20 ml-2 rounded-md px-2 py-0.5
                                font-mono text-xs
                              "
                              >
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
                              className="
                                text-primary font-medium opacity-0
                                transition-opacity
                                group-hover:opacity-100
                              "
                            />
                          </motion.div>
                        ))}
                      </div>
                    )
                  : (
                      <div className="p-12 text-center">
                        <div className="
                          bg-muted/20 mb-4 inline-flex h-16 w-16 items-center
                          justify-center rounded-full
                        "
                        >
                          <IconUsers className="
                            text-muted-foreground/30 h-8 w-8
                          "
                          />
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
