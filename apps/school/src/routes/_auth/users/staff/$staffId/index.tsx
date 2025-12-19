import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Edit, Trash2, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getStaffMember } from '@/school/functions/staff'

export const Route = createFileRoute('/_auth/users/staff/$staffId/')({
  component: StaffDetailPage,
  loader: async ({ params }) => {
    return await getStaffMember({ data: params.staffId })
  },
})

function StaffDetailPage() {
  const { t } = useTranslation()
  const { staffId } = Route.useParams()
  const staffData = Route.useLoaderData()

  const { data: staff } = useSuspenseQuery({
    queryKey: ['staff', staffId],
    queryFn: () => getStaffMember({ data: staffId }),
    initialData: staffData,
  })

  if (!staff) {
    return <div>{t('hr.staff.notFound')}</div>
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      on_leave: 'outline',
    }
    return (
      <Badge variant={variants[status] || 'default'}>
        {t(`hr.status.${status}`)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/users' },
          { label: t('hr.staff.title'), href: '/users/staff' },
          { label: staff.position },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{staff.position}</h1>
            <p className="text-muted-foreground">{staff.department || t('hr.staff.noDepartment')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/users/staff/$staffId/edit" params={{ staffId }}>
              <Edit className="mr-2 h-4 w-4" />
              {t('common.edit')}
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">{t('hr.staff.tabs.info')}</TabsTrigger>
          <TabsTrigger value="activity">{t('hr.staff.tabs.activity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('hr.staff.information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('hr.staff.position')}</p>
                  <p className="text-base">{t(`hr.positions.${staff.position}`)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('hr.staff.department')}</p>
                  <p className="text-base">{staff.department || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('hr.staff.hireDate')}</p>
                  <p className="text-base">
                    {staff.hireDate ? new Date(staff.hireDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('hr.staff.status')}</p>
                  <div>{getStatusBadge(staff.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('hr.staff.recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('hr.staff.noActivity')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
