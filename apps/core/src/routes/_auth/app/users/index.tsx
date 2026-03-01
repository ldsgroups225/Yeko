import type { Role, User } from '@repo/data-ops'
import { hasPermission } from '@repo/data-ops/auth/permissions'
import { IconClock, IconLoader2, IconMail, IconSearch, IconShield, IconShieldCheck, IconUser } from '@tabler/icons-react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  FieldLegend,
  FieldSet,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { assignUserSystemRoles } from '@/core/functions/users'
import { useDateFormatter } from '@/hooks/use-date-formatter'
import { useTranslations } from '@/i18n/hooks'
import { platformRolesQueryOptions } from '@/integrations/tanstack-query/platform-roles-options'
import {
  platformUsersKeys,
  platformUsersQueryOptions,
} from '@/integrations/tanstack-query/platform-users-options'

export const Route = createFileRoute('/_auth/app/users/')({
  beforeLoad: ({ context }) => {
    const permissions = context.auth?.permissions
    if (!context.auth?.isAuthenticated || (!context.auth?.isSuperAdmin && !hasPermission(permissions, 'users', 'view'))) {
      throw redirect({
        to: '/unauthorized',
      })
    }
  },
  component: UserManagement,
})

const userRolesSchema = z.object({
  roleIds: z.array(z.string()),
})

function UserManagement() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false)
  const { format: formatDate } = useDateFormatter()

  const { data: userData, isPending: isUsersPending } = useQuery(
    platformUsersQueryOptions({ search, page, limit: 10 }),
  )

  const { data: allRoles = [] } = useQuery(platformRolesQueryOptions('system'))

  const assignRolesMutation = useMutation({
    mutationFn: (data: { userId: string, roleIds: string[] }) => assignUserSystemRoles({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformUsersKeys.all })
      toast.success(t.users.updateSuccess())
      setIsRolesDialogOpen(false)
    },
    onError: () => toast.error(t.users.updateError()),
  })

  const form = useForm({
    defaultValues: {
      roleIds: [] as string[],
    },
    validators: {
      onChange: userRolesSchema,
    },
    onSubmit: async ({ value }) => {
      if (!selectedUser)
        return
      assignRolesMutation.mutate({ userId: selectedUser.id, roleIds: value.roleIds })
    },
  })

  const handleManageRoles = (user: User & { systemRoles?: string[] }) => {
    setSelectedUser(user as User)
    const currentRoleIds = allRoles
      .filter((r: Role) => user.systemRoles?.includes(r.slug))
      .map((r: Role) => r.id)

    form.setFieldValue('roleIds', currentRoleIds)
    setIsRolesDialogOpen(true)
  }

  const handleOpenChange = (open: boolean) => {
    setIsRolesDialogOpen(open)
    if (!open) {
      setSelectedUser(null)
      form.reset()
    }
  }

  const users = userData?.data || []
  const meta = userData?.meta

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      <div className="
        flex flex-col justify-between gap-4
        md:flex-row md:items-center
      "
      >
        <div>
          <h1 className="
            from-foreground via-foreground to-foreground/40 bg-linear-to-br
            bg-clip-text text-4xl font-black tracking-tighter text-transparent
            md:text-5xl
          "
          >
            {t.users.title()}
          </h1>
          <p className="
            text-muted-foreground/80 mt-2 max-w-2xl text-lg font-medium
          "
          >
            {t.users.subtitle()}
          </p>
        </div>

        <div className="
          group relative w-full
          md:w-96
        "
        >
          <IconSearch className="
            text-muted-foreground
            group-focus-within:text-primary
            absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transition-colors
          "
          />
          <Input
            placeholder={t.users.search()}
            className="
              bg-background/50 border-border/40
              focus:ring-primary/20
              h-12 rounded-full pl-12 font-medium shadow-sm transition-all
            "
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="
        border-border/40 bg-background/40 overflow-hidden rounded-[2.5rem]
        shadow-2xl backdrop-blur-xl
      "
      >
        <Table>
          <TableHeader className="bg-muted/30 border-border/20 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="
                h-14 w-[300px] text-[10px] font-black tracking-widest uppercase
              "
              >
                {t.users.table.user()}
              </TableHead>
              <TableHead className="
                h-14 text-[10px] font-black tracking-widest uppercase
              "
              >
                {t.users.table.status()}
              </TableHead>
              <TableHead className="
                h-14 text-[10px] font-black tracking-widest uppercase
              "
              >
                {t.users.table.roles()}
              </TableHead>
              <TableHead className="
                h-14 text-[10px] font-black tracking-widest uppercase
              "
              >
                {t.users.table.activity()}
              </TableHead>
              <TableHead className="
                h-14 pr-8 text-right text-[10px] font-black tracking-widest
                uppercase
              "
              >
                {t.users.table.actions()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isUsersPending
              ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <IconLoader2 className="
                          text-primary h-8 w-8 animate-spin
                        "
                        />
                        <span className="
                          text-muted-foreground text-sm font-bold
                        "
                        >
                          {t.users.syncing()}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              : users.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="bg-muted/20 rounded-full p-4">
                            <IconUser className="
                              text-muted-foreground/30 h-12 w-12
                            "
                            />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold">{t.users.none()}</h3>
                            <p className="
                              text-muted-foreground mx-auto max-w-xs text-sm
                            "
                            >
                              {t.users.noneDescription()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                : (users as (User & { systemRoles?: string[] })[]).map(user => (
                    <TableRow
                      key={user.id}
                      className="
                        group
                        hover:bg-primary/5
                        transition-all
                      "
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="
                            ring-primary/5
                            group-hover:ring-primary/20
                            h-12 w-12 shadow-sm ring-2 transition-all
                          "
                          >
                            <AvatarImage src={user.avatarUrl || undefined} />
                            <AvatarFallback className="
                              from-primary/20 to-primary/5 text-primary
                              bg-linear-to-br text-lg font-black
                            "
                            >
                              {user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="
                              group-hover:text-primary
                              text-base leading-none font-black tracking-tight
                              transition-colors
                            "
                            >
                              {user.name}
                            </span>
                            <span className="
                              text-muted-foreground/60 mt-2 flex items-center
                              gap-1.5 text-xs font-medium
                            "
                            >
                              <IconMail size={14} className="opacity-50" />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className={`
                            rounded-lg px-2.5 py-1 text-[10px] font-bold
                            capitalize
                            ${user.status === 'active'
                      ? `
                        bg-success/10 text-success border-success/20
                        hover:bg-success/20
                      `
                      : `bg-muted text-muted-foreground`}
                          `}
                        >
                          {user.status === 'active' ? t.status.active() : t.status.inactive()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {user.systemRoles && user.systemRoles.length > 0
                            ? (
                                user.systemRoles.map((role: string) => (
                                  <Badge
                                    key={role}
                                    variant="outline"
                                    className="
                                      bg-primary/5 border-primary/20
                                      text-primary rounded-md px-2 py-0.5
                                      text-[10px] font-black tracking-tighter
                                      uppercase shadow-xs
                                    "
                                  >
                                    {role}
                                  </Badge>
                                ))
                              )
                            : (
                                <span className="
                                  text-muted-foreground/40 text-[10px] font-bold
                                  tracking-widest uppercase italic
                                "
                                >
                                  Visiteur
                                </span>
                              )}
                        </div>
                      </TableCell>
                      <TableCell className="
                        text-muted-foreground/80 text-sm font-medium
                      "
                      >
                        {user.lastLoginAt
                          ? (
                              <div className="
                                flex items-center gap-2 capitalize
                              "
                              >
                                <IconClock size={16} className="text-primary/40" />
                                {formatDate(user.lastLoginAt, 'MEDIUM')}
                              </div>
                            )
                          : <span className="opacity-40">{t.users.neverLoggedIn()}</span>}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="
                            hover:bg-primary/10 hover:text-primary
                            h-10 gap-2 rounded-xl px-4 text-xs font-bold
                            transition-all
                          "
                          onClick={() => handleManageRoles(user)}
                        >
                          <IconShieldCheck size={18} />
                          <span>{t.users.permissions()}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
          </TableBody>
        </Table>

        {meta && meta.totalPages > 1 && (
          <div className="
            border-border/20 bg-muted/5 flex items-center justify-between
            border-t p-4 px-8
          "
          >
            <span className="
              text-muted-foreground/60 text-[10px] font-black tracking-widest
              uppercase
            "
            >
              {users.length}
              {' '}
              {t.common.details().toLowerCase()}
              {' '}
              sur
              {' '}
              {meta.total}
            </span>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-border/40 h-9 rounded-xl px-4 font-bold"
                disabled={!meta.hasPrev}
                onClick={() => setPage(page - 1)}
              >
                {t.common.previous()}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-border/40 h-9 rounded-xl px-4 font-bold"
                disabled={!meta.hasNext}
                onClick={() => setPage(page + 1)}
              >
                {t.common.next()}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isRolesDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="
          bg-card/95 border-border/40 max-h-[90vh] max-w-lg gap-0
          overflow-hidden rounded-3xl p-0 shadow-2xl backdrop-blur-xl
          sm:max-w-2xl
        "
        >
          <DialogHeader className="
            from-primary/5 border-border/20 bg-background/80 sticky top-0 z-20
            border-b bg-linear-to-b to-transparent p-5 backdrop-blur-md
            sm:p-8
          "
          >
            <div className="
              flex items-center gap-3
              sm:gap-4
            "
            >
              <div className="
                bg-primary/10 text-primary shrink-0 rounded-2xl p-2.5
                sm:p-3
              "
              >
                <IconShield className="
                  h-5 w-5
                  sm:h-6 sm:w-6
                "
                />
              </div>
              <div>
                <DialogTitle className="
                  text-xl font-bold tracking-tight
                  sm:text-2xl
                "
                >
                  {t.users.permissionsTitle()}
                </DialogTitle>
                <DialogDescription className="
                  line-clamp-1 text-sm
                  sm:text-base
                "
                >
                  {t.users.permissionsSubtitle({ name: selectedUser?.name || '' })}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="
              scrollbar-none max-h-[calc(90vh-120px)] space-y-8 overflow-y-auto
              p-5
              sm:p-8
            "
          >
            <form.Field
              name="roleIds"
              children={field => (
                <FieldSet>
                  <FieldLegend>{t.users.availableRoles()}</FieldLegend>
                  <div className="
                    grid grid-cols-1 gap-3
                    sm:grid-cols-2
                  "
                  >
                    {allRoles.map((role) => {
                      const isChecked = field.state.value.includes(role.id)
                      const toggle = () => {
                        const next = isChecked
                          ? field.state.value.filter(id => id !== role.id)
                          : [...field.state.value, role.id]
                        field.handleChange(next)
                      }

                      return (
                        <div
                          key={role.id}
                          role="button"
                          tabIndex={0}
                          onClick={toggle}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ')
                              toggle()
                          }}
                          className={`
                            flex cursor-pointer items-start gap-4 rounded-2xl
                            border p-4 shadow-xs transition-all
                            active:scale-[0.98]
                            ${
                        isChecked
                          ? `
                            bg-primary/10 border-primary/40 ring-primary/20
                            ring-1
                          `
                          : `
                            bg-background/40 border-border/60
                            hover:bg-primary/5 hover:border-primary/20
                          `
                        }
                          `}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={toggle}
                            className="pointer-events-none mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <p className={`
                              text-sm leading-none font-black tracking-tight
                              ${isChecked
                          ? `text-primary`
                          : `text-foreground`}
                            `}
                            >
                              {role.name}
                            </p>
                            <p className="
                              text-muted-foreground/60 text-[10px] font-bold
                              tracking-tighter uppercase
                            "
                            >
                              {role.slug}
                            </p>
                            {role.description && (
                              <p className="
                                text-muted-foreground pt-1 text-[11px]
                                leading-tight
                              "
                              >
                                {role.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </FieldSet>
              )}
            />

            <DialogFooter className="border-border/10 gap-3 border-t pt-8">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="rounded-xl px-6 font-bold"
                onClick={() => handleOpenChange(false)}
              >
                {t.common.cancel()}
              </Button>
              <form.Subscribe
                selector={state => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    size="lg"
                    className="
                      shadow-primary/20 rounded-xl px-10 font-black
                      tracking-widest uppercase shadow-xl transition-all
                      hover:scale-[1.02]
                    "
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting || assignRolesMutation.isPending ? t.common.loading() : t.common.save()}
                  </Button>
                )}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
