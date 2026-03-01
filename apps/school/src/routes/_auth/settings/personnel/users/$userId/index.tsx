import {
  IconCalendar,
  IconEdit,
  IconMail,
  IconPhone,
  IconTrash,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import { format } from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import {
  deleteExistingUser,
  getUser,
  getUserActivity,
} from '@/school/functions/users'

export const Route = createFileRoute('/_auth/settings/personnel/users/$userId/')({
  component: UserDetailsPage,
})

function UserDetailsPage() {
  const { userId } = Route.useParams()
  const t = useTranslations()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: userResult, isPending } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const result = await getUser({ data: userId })
      return result
    },
  })
  const user = userResult?.success ? userResult.data : null

  const { data: activityResult } = useQuery({
    queryKey: ['user-activity', userId],
    queryFn: async () => {
      const result = await getUserActivity({ data: { userId, limit: 20 } })
      return result
    },
  })
  const activity = activityResult?.success ? activityResult.data : []

  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.users.delete,
    mutationFn: async () => {
      return await deleteExistingUser({ data: userId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(t.hr.users.deleteSuccess())
      navigate({ to: '/settings/personnel/users', search: { page: 1 } })
    },
    onError: () => {
      toast.error(t.hr.users.deleteError())
    },
  })

  if (isPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="
            border-primary h-8 w-8 animate-spin rounded-full border-4
            border-t-transparent
          "
          />
          <p className="text-muted-foreground mt-4 text-sm">
            {t.common.loading()}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">{t.errors.notFound()}</p>
          <Button
            render={(
              <Link to="/settings/personnel/users" search={{ page: 1 }}>
                {t.common.back()}
              </Link>
            )}
            className="mt-4"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.settings(), href: '/settings' },
          { label: t.sidebar.personnel(), href: '/settings/personnel' },
          { label: t.hr.users.title(), href: '/settings/personnel/users' },
          { label: user.name },
        ]}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="
            bg-primary/10 text-primary flex h-16 w-16 items-center
            justify-center rounded-full text-2xl font-bold
          "
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <IconTrash className="mr-2 h-4 w-4" />
            {t.common.delete()}
          </Button>
          <Button
            size="sm"
            onClick={() =>
              navigate({ to: '/settings/personnel/users/$userId/edit', params: { userId } })}
          >
            <IconEdit className="mr-2 h-4 w-4" />
            {t.common.edit()}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">{t.hr.users.tabs.info()}</TabsTrigger>
          <TabsTrigger value="roles">{t.hr.users.tabs.roles()}</TabsTrigger>
          <TabsTrigger value="activity">
            {t.hr.users.tabs.activity()}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {t.hr.users.personalInfo()}
            </h2>
            <div className="
              grid gap-4
              md:grid-cols-2
            "
            >
              <div className="flex items-center gap-3">
                <IconMail className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    {t.hr.common.email()}
                  </p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <IconPhone className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {t.hr.common.phone()}
                    </p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <IconCalendar className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    {t.hr.common.createdAt()}
                  </p>
                  <p className="font-medium">
                    {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-muted-foreground text-sm">
                    {t.hr.users.status()}
                  </p>
                  <Badge
                    variant={
                      user.status === 'active'
                        ? 'default'
                        : user.status === 'suspended'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {(() => {
                      switch (user.status) {
                        case 'active':
                          return t.hr.status.active()
                        case 'inactive':
                          return t.hr.status.inactive()
                        case 'suspended':
                          return t.hr.status.suspended()
                        default:
                          return user.status
                      }
                    })()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {t.hr.users.assignedRoles()}
            </h2>
            <div className="space-y-3">
              {user.roles && user.roles.length > 0
                ? (
                    user.roles.map(role => (
                      <div
                        key={role.roleId}
                        className="
                          flex items-center justify-between rounded-md border
                          p-3
                        "
                      >
                        <div>
                          <p className="font-medium">{role.roleName}</p>
                        </div>
                        <Badge variant="secondary">{t.hr.roles.systemRole()}</Badge>
                      </div>
                    ))
                  )
                : (
                    <p className="text-muted-foreground text-sm">
                      {t.hr.users.noRoles()}
                    </p>
                  )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {t.hr.users.recentActivity()}
            </h2>
            <div className="space-y-3">
              {activity && activity.length > 0
                ? (
                    activity.map(log => (
                      <div
                        key={log.id}
                        className="
                          flex gap-3 border-b pb-3
                          last:border-0
                        "
                      >
                        <div className="
                          bg-primary mt-1 flex h-2 w-2 shrink-0 rounded-full
                        "
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-muted-foreground text-xs">
                            {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))
                  )
                : (
                    <p className="text-muted-foreground text-sm">
                      {t.hr.users.noActivity()}
                    </p>
                  )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t.hr.users.deleteUser()}
        description={t.hr.users.deleteConfirm()}
        confirmText={user?.name}
        onConfirm={() => deleteMutation.mutate()}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
