import { IconEdit, IconShield, IconTrash } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { getRole } from '@/school/functions/roles'

export const Route = createFileRoute('/_auth/users/roles/$roleId/')({
  component: RoleDetailPage,
  loader: async ({ params }) => {
    return await getRole({ data: params.roleId })
  },
})

function RoleDetailPage() {
  const t = useTranslations()
  const { roleId } = Route.useParams()
  const roleData = Route.useLoaderData()

  const { data: role } = useSuspenseQuery({
    queryKey: ['role', roleId],
    queryFn: () => getRole({ data: roleId }),
    initialData: roleData,
  })

  if (!role) {
    return <div>{t.hr.roles.notFound()}</div>
  }

  const permissions = role.permissions as Record<string, string[]>

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.hr.title(), href: '/users' },
          { label: t.hr.roles.title(), href: '/users/roles' },
          { label: role.name },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <IconShield className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{role.name}</h1>
              {role.isSystemRole && (
                <Badge variant="secondary">{t.hr.roles.systemRole()}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {role.description || t.hr.roles.noDescription()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!role.isSystemRole && (
            <>
              <Button
                variant="outline"
                render={(
                  <Link to="/users/roles/$roleId/edit" params={{ roleId }}>
                    <IconEdit className="mr-2 h-4 w-4" />
                    {t.common.edit()}
                  </Link>
                )}
              />
              <Button variant="destructive">
                <IconTrash className="mr-2 h-4 w-4" />
                {t.common.delete()}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.hr.roles.information()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.hr.roles.slug()}
              </p>
              <p className="text-base font-mono">{role.slug}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.hr.roles.scope()}
              </p>
              <Badge
                variant={role.scope === 'system' ? 'default' : 'secondary'}
              >
                {role.scope}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.hr.roles.usersWithRole()}
              </p>
              <p className="text-base">{role.userCount || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.hr.roles.permissionCount()}
              </p>
              <p className="text-base">{role.permissionCount || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.hr.roles.permissions()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(permissions).map(([resource, actions]) => (
                <div key={resource}>
                  <p className="mb-2 text-sm font-medium">{resource}</p>
                  <div className="flex flex-wrap gap-1">
                    {actions.map(action => (
                      <Badge key={action} variant="outline" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(permissions).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t.hr.roles.noPermissions()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
