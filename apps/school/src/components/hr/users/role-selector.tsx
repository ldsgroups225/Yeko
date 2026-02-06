import { IconCheck, IconInfoCircle, IconLoader2, IconShield, IconShieldExclamation, IconSparkles, IconX } from '@tabler/icons-react'
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

  const { data, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <IconLoader2 className="h-10 w-10 animate-spin text-primary/60" />
          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">{t.common.loading()}</p>
      </div>
    )
  }

  if (roles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-dashed border-border/40 bg-card/30 backdrop-blur-sm p-12 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
          <IconShieldExclamation className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {t.hr.roles.noRoles()}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconShield className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-foreground">
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
            className="rounded-xl h-8 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-all px-3"
            onClick={handleSelectAll}
            disabled={disabled || filteredRoles.length === selectedRoleIds.length}
          >
            <IconSparkles className="mr-1.5 h-3 w-3" />
            {t.hr.roles.selectAll()}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-xl h-8 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive transition-all px-3"
            onClick={handleDeselectAll}
            disabled={disabled || selectedRoleIds.length === 0}
          >
            <IconX className="mr-1.5 h-3 w-3" />
            {t.hr.roles.deselectAll()}
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Available Roles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">{t.hr.roles.available()}</h3>
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-muted/50 border-border/40">
              {availableRoles.length}
            </Badge>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/20 backdrop-blur-sm p-3 min-h-[300px] max-h-[500px] overflow-y-auto space-y-3 custom-scrollbar shadow-inner">
            <AnimatePresence mode="popLayout">
              {availableRoles.length === 0
                ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center h-[260px] text-sm text-muted-foreground italic"
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
                          'group relative rounded-xl border border-border/40 bg-background/50 p-4 cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/30 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] shadow-sm',
                          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                        )}
                        onClick={() => handleSelect(role.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-foreground truncate">
                                {role.name}
                              </p>
                              {role.scope === 'system' && (
                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">
                                  {t.hr.roles.system()}
                                </Badge>
                              )}
                            </div>
                            {role.description && (
                              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                {role.description}
                              </p>
                            )}
                          </div>
                          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
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
            <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">{t.hr.roles.selectedRoles()}</h3>
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary border-primary/20">
              {selectedRoles.length}
            </Badge>
          </div>
          <div className="rounded-xl border border-border/40 bg-primary/5 backdrop-blur-sm p-3 min-h-[300px] max-h-[500px] overflow-y-auto space-y-3 custom-scrollbar shadow-inner">
            <AnimatePresence mode="popLayout">
              {selectedRoles.length === 0
                ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center h-[260px] text-sm text-muted-foreground italic"
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
                          'group relative rounded-xl border border-primary/20 bg-card p-4 cursor-pointer transition-all hover:bg-destructive/5 hover:border-destructive/30 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] shadow-sm',
                          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                        )}
                        onClick={() => handleDeselect(role.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-foreground truncate">
                                {role.name}
                              </p>
                              {role.scope === 'system' && (
                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">
                                  {t.hr.roles.system()}
                                </Badge>
                              )}
                            </div>
                            {role.description && (
                              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                {role.description}
                              </p>
                            )}
                          </div>
                          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-destructive/5 text-destructive opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
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
        <IconInfoCircle className="h-3 w-3 text-muted-foreground" />
        <p className="text-[11px] font-medium text-muted-foreground">
          {t.hr.roles.doubleClickHint()}
        </p>
      </div>
    </div>
  )
}
