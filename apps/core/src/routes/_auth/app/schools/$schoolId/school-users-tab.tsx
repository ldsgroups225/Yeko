import { IconDotsVertical, IconUsers } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { buttonVariants } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@workspace/ui/components/dropdown-menu'
import { Separator } from '@workspace/ui/components/separator'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { CreateAdminDialog } from '@/components/schools/create-admin-dialog'

interface SchoolUsersTabProps {
  schoolId: string
  schoolName: string
  users: any[]
  isPending: boolean
  adminCount: number
  teacherCount: number
  staffCount: number
  onSuspend: (user: { id: string, name: string }) => void
  onRemove: (user: { id: string, name: string }) => void
}

export function SchoolUsersTab({
  schoolId,
  schoolName,
  users,
  isPending,
  adminCount,
  teacherCount,
  staffCount,
  onSuspend,
  onRemove,
}: SchoolUsersTabProps) {
  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Utilisateurs de l'école</CardTitle>
            <CardDescription>Administrateurs, enseignants et personnel rattachés à cette école.</CardDescription>
          </div>
          <CreateAdminDialog schoolId={schoolId} schoolName={schoolName} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{adminCount}</div>
                <p className="text-xs text-muted-foreground">Administrateurs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{teacherCount}</div>
                <p className="text-xs text-muted-foreground">Enseignants</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{staffCount}</div>
                <p className="text-xs text-muted-foreground">Personnel</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {users.length === 0
            ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <IconUsers className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-medium">Aucun utilisateur pour le moment</p>
                  <p className="text-sm">Commencez par ajouter des administrateurs et enseignants</p>
                </div>
              )
            : (
                <div className="space-y-2">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">
                          {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <Badge variant="outline" className="text-xs">{user.roles?.[0] || 'Utilisateur'}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {user.status === 'active' ? 'Actif' : user.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={(
                              <button type="button" className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8' })}>
                                <IconDotsVertical className="h-4 w-4" />
                              </button>
                            )}
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onSuspend({ id: user.id, name: user.name })} disabled={user.status === 'suspended'}>
                              Suspendre
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onRemove({ id: user.id, name: user.name })} className="text-destructive focus:text-destructive">
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
      </CardContent>
    </Card>
  )
}
