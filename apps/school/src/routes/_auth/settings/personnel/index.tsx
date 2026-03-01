import {
  IconArrowRight,
  IconPlus,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/settings/personnel/')({
  component: PersonnelSettingsHubPage,
})

function PersonnelSettingsHubPage() {
  const t = useTranslations()
  const navigate = useNavigate()

  const modules = [
    {
      key: 'users',
      icon: IconUser,
      title: t.hr.users.title(),
      description: t.hr.users.description(),
      manageHref: '/settings/personnel/users',
      onCreate: () => navigate({ to: '/settings/personnel/users/new' }),
      createLabel: t.hr.users.addUser(),
    },
    {
      key: 'staff',
      icon: IconUsersGroup,
      title: t.hr.staff.title(),
      description: t.hr.staff.description(),
      manageHref: '/settings/personnel/staff',
      onCreate: () => navigate({ to: '/settings/personnel/staff/new' }),
      createLabel: t.hr.staff.addStaff(),
    },
  ] as const

  return (
    <div className="space-y-8 p-1">
      <Card className="border-border/40 bg-card/40 rounded-2xl backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconUsersGroup className="text-primary size-5" />
                {t.sidebar.personnel()}
              </CardTitle>
              <CardDescription>
                Gérez les utilisateurs et le personnel depuis un seul écran.
              </CardDescription>
            </div>

            <Link
              to="/settings/personnel"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-xl gap-2')}
            >
              <IconUsersGroup className="size-4" />
              {t.sidebar.personnel()}
            </Link>
          </div>
        </CardHeader>
        <CardContent
          className="
            grid grid-cols-1 gap-4
            md:grid-cols-2
          "
        >
          {modules.map(module => (
            <Card
              key={module.key}
              className="
                border-border/40 bg-muted/10
                hover:bg-muted/20
                rounded-2xl border transition-colors
              "
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                    <module.icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold">{module.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Button
                  onClick={module.onCreate}
                  size="sm"
                  className="rounded-xl"
                >
                  <IconPlus className="mr-2 size-4" />
                  {module.createLabel}
                </Button>
                <Link
                  to={module.manageHref}
                  search={{ page: 1 }}
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'rounded-xl')}
                >
                  Gérer
                  <IconArrowRight className="ml-2 size-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
