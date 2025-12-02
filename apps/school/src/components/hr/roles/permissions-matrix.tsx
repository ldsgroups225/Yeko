import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface PermissionsMatrixProps {
  value: Record<string, string[]>
  onChange: (permissions: Record<string, string[]>) => void
}

// Define available resources and actions
const RESOURCES = [
  'users',
  'teachers',
  'staff',
  'students',
  'classes',
  'grades',
  'finance',
  'reports',
  'settings',
] as const

const ACTIONS = ['view', 'create', 'edit', 'delete'] as const

export function PermissionsMatrix({ value, onChange }: PermissionsMatrixProps) {
  const { t } = useTranslation()

  const handleToggle = (resource: string, action: string) => {
    const currentActions = value[resource] || []
    const newActions = currentActions.includes(action)
      ? currentActions.filter(a => a !== action)
      : [...currentActions, action]

    if (newActions.length === 0) {
      const { [resource]: _removed, ...rest } = value
      onChange(rest)
    }
    else {
      onChange({
        ...value,
        [resource]: newActions,
      })
    }
  }

  const handleSelectAll = (resource: string) => {
    const currentActions = value[resource] || []
    if (currentActions.length === ACTIONS.length) {
      // Deselect all

      const { [resource]: _removed, ...rest } = value
      onChange(rest)
    }
    else {
      // Select all
      onChange({
        ...value,
        [resource]: [...ACTIONS],
      })
    }
  }

  const isChecked = (resource: string, action: string) => {
    return value[resource]?.includes(action) || false
  }

  const isAllSelected = (resource: string) => {
    return value[resource]?.length === ACTIONS.length
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left text-sm font-medium">
                {t('hr.roles.resource')}
              </th>
              {ACTIONS.map(action => (
                <th key={action} className="p-3 text-center text-sm font-medium">
                  {t(`hr.actions.${action}`)}
                </th>
              ))}
              <th className="p-3 text-center text-sm font-medium">
                {t('hr.roles.selectAll')}
              </th>
            </tr>
          </thead>
          <tbody>
            {RESOURCES.map(resource => (
              <tr key={resource} className="border-b hover:bg-muted/50">
                <td className="p-3">
                  <Label className="font-medium">
                    {t(`hr.resources.${resource}`)}
                  </Label>
                </td>
                {ACTIONS.map(action => (
                  <td key={action} className="p-3 text-center">
                    <Checkbox
                      checked={isChecked(resource, action)}
                      onCheckedChange={() => handleToggle(resource, action)}
                    />
                  </td>
                ))}
                <td className="p-3 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAll(resource)}
                  >
                    {isAllSelected(resource)
                      ? t('hr.roles.deselectAll')
                      : t('hr.roles.selectAll')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm font-medium">{t('hr.roles.selectedPermissions')}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {Object.keys(value).length === 0
            ? t('hr.roles.noPermissionsSelected')
            : t('hr.roles.permissionsCount', {
                count: Object.values(value).flat().length,
              })}
        </p>
      </div>
    </div>
  )
}
