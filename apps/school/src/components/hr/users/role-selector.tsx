import { useQuery } from '@tanstack/react-query'
import { CheckIcon, Loader2, XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getRoles } from '@/school/functions/roles'

interface Role {
  id: string
  name: string
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
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ['roles-for-user'],
    queryFn: async () => {
      const result = await getRoles({
        data: {
          pagination: { page: 1, limit: 100 },
        },
      })
      return result.roles as Role[]
    },
  })

  const roles = data ?? []
  const availableRoles = roles.filter(r => !selectedRoleIds.includes(r.id))
  const selectedRoles = roles.filter(r => selectedRoleIds.includes(r.id))

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
      onChange(roles.map(r => r.id))
    }
  }

  const handleDeselectAll = () => {
    if (!disabled) {
      onChange([])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (roles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t('hr.roles.noRoles')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedRoleIds.length > 0
            ? (
                <span>
                  {selectedRoleIds.length}
                  {' '}
                  {t('hr.roles.selected')}
                </span>
              )
            : (
                <span>{t('hr.roles.selectRoles')}</span>
              )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled || roles.length === selectedRoleIds.length}
          >
            {t('hr.roles.selectAll')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={disabled || selectedRoleIds.length === 0}
          >
            {t('hr.roles.deselectAll')}
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Available Roles */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t('hr.roles.available')}</h3>
          <div className="rounded-lg border bg-muted/30 p-3 min-h-[200px] max-h-[400px] overflow-y-auto">
            {availableRoles.length === 0
              ? (
                  <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
                    {t('hr.roles.allSelected')}
                  </div>
                )
              : (
                  <div className="space-y-2">
                    {availableRoles.map(role => (
                      <div
                        key={role.id}
                        className={cn(
                          'group relative rounded-md border bg-card p-3 cursor-pointer transition-colors hover:bg-accent hover:border-accent-foreground/20',
                          disabled && 'opacity-50 cursor-not-allowed',
                        )}
                        onClick={() => handleSelect(role.id)}
                        onDoubleClick={() => handleSelect(role.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleSelect(role.id)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {role.name}
                              </p>
                              {role.scope === 'system' && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('hr.roles.system')}
                                </Badge>
                              )}
                            </div>
                            {role.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {role.description}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelect(role.id)
                            }}
                            disabled={disabled}
                          >
                            <CheckIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </div>
        </div>

        {/* Selected Roles */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t('hr.roles.selectedRoles')}</h3>
          <div className="rounded-lg border bg-primary/5 p-3 min-h-[200px] max-h-[400px] overflow-y-auto">
            {selectedRoles.length === 0
              ? (
                  <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
                    {t('hr.roles.noRolesSelected')}
                  </div>
                )
              : (
                  <div className="space-y-2">
                    {selectedRoles.map(role => (
                      <div
                        key={role.id}
                        className={cn(
                          'group relative rounded-md border border-primary/20 bg-card p-3 cursor-pointer transition-colors hover:bg-destructive/10 hover:border-destructive/30',
                          disabled && 'opacity-50 cursor-not-allowed',
                        )}
                        onClick={() => handleDeselect(role.id)}
                        onDoubleClick={() => handleDeselect(role.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleDeselect(role.id)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {role.name}
                              </p>
                              {role.scope === 'system' && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('hr.roles.system')}
                                </Badge>
                              )}
                            </div>
                            {role.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {role.description}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeselect(role.id)
                            }}
                            disabled={disabled}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        {t('hr.roles.doubleClickHint')}
      </p>
    </div>
  )
}
