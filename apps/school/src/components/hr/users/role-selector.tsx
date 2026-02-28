import { IconCheck, IconInfoCircle, IconLoader2, IconShield, IconShieldExclamation, IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { getRoles } from '@/school/functions/roles'

interface Role {
  id: string
  name: string
  slug: string
  description?: string
  scope: 'system' | 'school'
}

interface RoleSelectorProps {
  selectedRoleIds: string[]
  onChange: (roleIds: string[]) => void
  disabled?: boolean
}

export function RoleSelector({
  selectedRoleIds,
  onChange,
  disabled,
}: RoleSelectorProps) {
  const t = useTranslations()

  const { data, isPending } = useQuery({
    queryKey: ['roles-for-user'],
    queryFn: async () => {
      const result = await getRoles({
        data: {
          pagination: { page: 1, limit: 100 },
        },
      })
      if (!result.success)
        return []
      return result.data.roles as Role[]
    },
  })

  const roles = data ?? []
  const filteredRoles = roles.filter(r => r.scope !== 'system' && r.slug !== 'school_founder')
  const availableRoles = filteredRoles.filter(r => !selectedRoleIds.includes(r.id))
  const selectedRoles = filteredRoles.filter(r => selectedRoleIds.includes(r.id))

  const handleSelect = (roleId: string) => {
    if (!disabled) {
      onChange([...selectedRoleIds, roleId])
    }
  }

  const handleDeselect = (roleId: string) => {
    if (!disabled) {
      onChange(selectedRoleIds.filter(id => id !== roleId))
    }
  }

  const handleSelectAll = () => {
    if (!disabled) {
      onChange(filteredRoles.map(r => r.id))
    }
  }

  const handleDeselectAll = () => {
    if (!disabled) {
      onChange([])
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
        <div className="relative">
          <IconLoader2 className="text-primary/60 h-10 w-10 animate-spin" />
          <div className="
            bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-xl
          "
          />
        </div>
        <p className="text-muted-foreground animate-pulse text-sm font-medium">{t.common.loading()}</p>
      </div>
    )
  }

  if (roles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          border-border/40 bg-card/30 rounded-xl border border-dashed p-12
          text-center backdrop-blur-sm
        "
      >
        <div className="
          bg-muted/50 mx-auto mb-4 flex h-12 w-12 items-center justify-center
          rounded-full
        "
        >
          <IconShieldExclamation className="text-muted-foreground h-6 w-6" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          {t.hr.roles.noRoles()}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="
        border-border/40 flex items-center justify-between border-b pb-2
      "
      >
        <div className="flex items-center gap-2">
          <div className="
            bg-primary/10 text-primary flex h-8 w-8 items-center justify-center
            rounded-lg
          "
          >
            <IconShield className="h-4 w-4" />
          </div>
          <div className="text-foreground text-sm font-semibold">
            {selectedRoleIds.length > 0
              ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-primary">{selectedRoleIds.length}</span>
                    {t.hr.roles.selected()}
                  </span>
                )
              : (
                  <span>{t.hr.roles.selectRoles()}</span>
                )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="
              hover:bg-primary/10 hover:text-primary
              h-8 rounded-xl px-3 text-xs font-semibold transition-all
            "
            onClick={handleSelectAll}
            disabled={disabled || filteredRoles.length === selectedRoleIds.length}
          >

            {t.hr.roles.selectAll()}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="
              hover:bg-destructive/10 hover:text-destructive
              h-8 rounded-xl px-3 text-xs font-semibold transition-all
            "
            onClick={handleDeselectAll}
            disabled={disabled || selectedRoleIds.length === 0}
          >
            <IconX className="mr-1.5 h-3 w-3" />
            {t.hr.roles.deselectAll()}
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="
        grid gap-6
        md:grid-cols-2
      "
      >
        {/* Available Roles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="
              text-foreground text-sm font-bold tracking-tight uppercase
            "
            >
              {t.hr.roles.available()}
            </h3>
            <Badge
              variant="outline"
              className="
                bg-muted/50 border-border/40 text-[10px] font-bold
                tracking-widest uppercase
              "
            >
              {availableRoles.length}
            </Badge>
          </div>
          <div className="
            border-border/40 bg-card/20 custom-scrollbar max-h-[500px]
            min-h-[300px] space-y-3 overflow-y-auto rounded-xl border p-3
            shadow-inner backdrop-blur-sm
          "
          >
            <AnimatePresence mode="popLayout">
              {availableRoles.length === 0
                ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="
                        text-muted-foreground flex h-[260px] items-center
                        justify-center text-sm italic
                      "
                    >
                      {t.hr.roles.allSelected()}
                    </motion.div>
                  )
                : (
                    availableRoles.map(role => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={role.id}
                        className={cn(
                          `
                            group border-border/40 bg-background/50
                            hover:bg-primary/5 hover:border-primary/30
                            relative cursor-pointer rounded-xl border p-4
                            shadow-sm transition-all
                            hover:scale-[1.01] hover:shadow-md
                            active:scale-[0.99]
                          `,
                          disabled && `
                            pointer-events-none cursor-not-allowed opacity-50
                          `,
                        )}
                        onClick={() => handleSelect(role.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="
                                text-foreground truncate text-sm font-bold
                              "
                              >
                                {role.name}
                              </p>
                              {role.scope === 'system' && (
                                <Badge
                                  variant="secondary"
                                  className="
                                    bg-accent/10 text-accent-foreground
                                    border-accent/20 px-1.5 py-0 text-[10px]
                                    font-bold uppercase
                                  "
                                >
                                  {t.hr.roles.system()}
                                </Badge>
                              )}
                            </div>
                            {role.description && (
                              <p className="
                                text-muted-foreground mt-1.5 line-clamp-2
                                text-xs leading-relaxed
                              "
                              >
                                {role.description}
                              </p>
                            )}
                          </div>
                          <div className="
                            bg-primary/5 text-primary flex h-8 w-8 translate-x-1
                            transform items-center justify-center rounded-lg
                            opacity-0 transition-all
                            group-hover:translate-x-0 group-hover:opacity-100
                          "
                          >
                            <IconCheck className="h-4 w-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected Roles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="
              text-foreground text-sm font-bold tracking-tight uppercase
            "
            >
              {t.hr.roles.selectedRoles()}
            </h3>
            <Badge
              variant="outline"
              className="
                bg-primary/10 text-primary border-primary/20 text-[10px]
                font-bold tracking-widest uppercase
              "
            >
              {selectedRoles.length}
            </Badge>
          </div>
          <div className="
            border-border/40 bg-primary/5 custom-scrollbar max-h-[500px]
            min-h-[300px] space-y-3 overflow-y-auto rounded-xl border p-3
            shadow-inner backdrop-blur-sm
          "
          >
            <AnimatePresence mode="popLayout">
              {selectedRoles.length === 0
                ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="
                        text-muted-foreground flex h-[260px] items-center
                        justify-center text-sm italic
                      "
                    >
                      {t.hr.roles.noRolesSelected()}
                    </motion.div>
                  )
                : (
                    selectedRoles.map(role => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={role.id}
                        className={cn(
                          `
                            group border-primary/20 bg-card
                            hover:bg-destructive/5 hover:border-destructive/30
                            relative cursor-pointer rounded-xl border p-4
                            shadow-sm transition-all
                            hover:scale-[1.01] hover:shadow-md
                            active:scale-[0.99]
                          `,
                          disabled && `
                            pointer-events-none cursor-not-allowed opacity-50
                          `,
                        )}
                        onClick={() => handleDeselect(role.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="
                                text-foreground truncate text-sm font-bold
                              "
                              >
                                {role.name}
                              </p>
                              {role.scope === 'system' && (
                                <Badge
                                  variant="secondary"
                                  className="
                                    bg-accent/10 text-accent-foreground
                                    border-accent/20 px-1.5 py-0 text-[10px]
                                    font-bold uppercase
                                  "
                                >
                                  {t.hr.roles.system()}
                                </Badge>
                              )}
                            </div>
                            {role.description && (
                              <p className="
                                text-muted-foreground mt-1.5 line-clamp-2
                                text-xs leading-relaxed
                              "
                              >
                                {role.description}
                              </p>
                            )}
                          </div>
                          <div className="
                            bg-destructive/5 text-destructive flex h-8 w-8
                            translate-x-1 transform items-center justify-center
                            rounded-lg opacity-0 transition-all
                            group-hover:translate-x-0 group-hover:opacity-100
                          "
                          >
                            <IconX className="h-4 w-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="flex items-center gap-2 px-1">
        <IconInfoCircle className="text-muted-foreground h-3 w-3" />
        <p className="text-muted-foreground text-[11px] font-medium">
          {t.hr.roles.doubleClickHint()}
        </p>
      </div>
    </div>
  )
}
