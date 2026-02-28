import type { RoleFormData } from '@/schemas/role'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Label } from '@workspace/ui/components/label'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

export type Permissions = RoleFormData['permissions']

interface PermissionsMatrixProps {
  value: Permissions
  onChange: (permissions: Permissions) => void
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
  const t = useTranslations()

  const handleToggle = (resource: string, action: Permissions[string][number]) => {
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
      const { [resource]: _removed, ...rest } = value
      onChange(rest)
    }
    else {
      onChange({
        ...value,
        [resource]: [...ACTIONS],
      })
    }
  }

  const isChecked = (resource: string, action: Permissions[string][number]) => {
    return value[resource]?.includes(action) || false
  }

  const isAllSelected = (resource: string) => {
    return value[resource]?.length === ACTIONS.length
  }

  return (
    <div className="space-y-6">
      <div className="
        border-border/40 bg-background/30 overflow-hidden rounded-xl border
        backdrop-blur-sm
      "
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 backdrop-blur-md">
                <th className="
                  text-muted-foreground p-4 text-left text-xs font-semibold
                  tracking-wider uppercase
                "
                >
                  {t.hr.roles.resource()}
                </th>
                {ACTIONS.map((action) => {
                  const actionTranslations = {
                    view: t.hr.actions.view,
                    create: t.hr.actions.create,
                    edit: t.hr.actions.edit,
                    delete: t.hr.actions.delete,
                  }
                  return (
                    <th
                      key={action}
                      className="
                        text-muted-foreground p-4 text-center text-xs
                        font-semibold tracking-wider uppercase
                      "
                    >
                      {actionTranslations[action]()}
                    </th>
                  )
                })}
                <th className="
                  text-muted-foreground p-4 text-center text-xs font-semibold
                  tracking-wider whitespace-nowrap uppercase
                "
                >
                  {t.hr.roles.selectAll()}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border/40 divide-y">
              {RESOURCES.map(resource => (
                <motion.tr
                  key={resource}
                  className="
                    group
                    hover:bg-primary/5
                    transition-colors
                  "
                  initial={false}
                >
                  <td className="p-4">
                    <Label className="
                      text-foreground cursor-pointer font-semibold
                    "
                    >
                      {{
                        users: t.hr.resources.users,
                        teachers: t.hr.resources.teachers,
                        staff: t.hr.resources.staff,
                        students: t.hr.resources.students,
                        classes: t.hr.resources.classes,
                        grades: t.hr.resources.grades,
                        finance: t.hr.resources.finance,
                        reports: t.hr.resources.reports,
                        settings: t.hr.resources.settings,
                      }[resource]()}
                    </Label>
                  </td>
                  {ACTIONS.map(action => (
                    <td key={action} className="p-4 text-center">
                      <Checkbox
                        checked={isChecked(resource, action)}
                        onCheckedChange={() => handleToggle(resource, action)}
                        className="
                          transition-transform
                          active:scale-90
                        "
                      />
                    </td>
                  ))}
                  <td className="p-4 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAll(resource)}
                      className="
                        hover:bg-primary/10 hover:text-primary
                        h-8 rounded-lg px-3 text-xs font-medium transition-all
                      "
                    >
                      {isAllSelected(resource)
                        ? t.hr.roles.deselectAll()
                        : t.hr.roles.selectAll()}
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <motion.div
        layout
        className="
          bg-primary/5 border-primary/10 rounded-xl border p-5 backdrop-blur-sm
        "
      >
        <div className="flex items-center gap-3">
          <div className="
            bg-primary/10 text-primary flex h-10 w-10 items-center
            justify-center rounded-full shadow-inner
          "
          >
            <ShieldIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-foreground text-sm font-semibold">{t.hr.roles.selectedPermissions()}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {Object.keys(value).length === 0
                ? t.hr.roles.noPermissionsSelected()
                : t.hr.roles.permissionsCount({
                    count: Object.values(value).flat().length,
                  })}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}
