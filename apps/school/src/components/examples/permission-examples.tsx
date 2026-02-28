/**
 * Permission System Usage Examples
 *
 * This file demonstrates how to use the permission system in Yeko School.
 * These examples can be used as reference when implementing features.
 */

import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { MultiPermissionGuard, PermissionGuard } from '@/components/auth/permission-guard'
import { usePermissions } from '@/hooks/use-permissions'

/**
 * Example 1: Using the usePermissions hook directly
 */
export function UserManagementExample() {
  const { can, canAny, isPending } = usePermissions()

  if (isPending) {
    return <div>Loading permissions...</div>
  }

  return (
    <div className="space-y-4">
      {/* Show user list if user can view users */}
      {can('view', 'users') && (
        <div>
          <h2>IconUsers List</h2>
          {/* IconUser list component */}
        </div>
      )}

      {/* Show create button if user can create users */}
      {can('create', 'users') && (
        <Button>Add New User</Button>
      )}

      {/* Show manage button if user can edit OR delete */}
      {canAny(['edit', 'delete'], 'users') && (
        <Button variant="outline">Manage Users</Button>
      )}
    </div>
  )
}

/**
 * Example 2: Using PermissionGuard component
 */
export function StudentManagementExample() {
  return (
    <div className="space-y-4">
      {/* Only show if user can view students */}
      <PermissionGuard action="view" resource="students">
        <div>
          <h2>Students List</h2>
          {/* Student list component */}
        </div>
      </PermissionGuard>

      {/* Show create button with permission check */}
      <PermissionGuard action="create" resource="students">
        <Button>Enroll New Student</Button>
      </PermissionGuard>

      {/* Show access denied message if no permission */}
      <PermissionGuard
        action="delete"
        resource="students"
        showDenied
      >
        <Button variant="destructive">Delete Student</Button>
      </PermissionGuard>
    </div>
  )
}

/**
 * Example 3: Using MultiPermissionGuard for complex checks
 */
export function FinanceManagementExample() {
  return (
    <div className="space-y-4">
      {/* IconUser needs EITHER view OR create permission */}
      <MultiPermissionGuard
        actions={['view', 'create']}
        resource="finance"
        mode="any"
      >
        <div>Finance Dashboard</div>
      </MultiPermissionGuard>

      {/* IconUser needs BOTH edit AND delete permissions */}
      <MultiPermissionGuard
        actions={['edit', 'delete']}
        resource="finance"
        mode="all"
      >
        <Button variant="destructive">Delete Transaction</Button>
      </MultiPermissionGuard>

      {/* Show fallback if no permission */}
      <MultiPermissionGuard
        actions={['process_payment']}
        resource="finance"
        fallback={<div>You cannot process payments</div>}
      >
        <Button>Process Payment</Button>
      </MultiPermissionGuard>
    </div>
  )
}

/**
 * Example 4: Conditional rendering based on multiple resources
 */
export function DashboardExample() {
  const { can } = usePermissions()

  const canViewUsers = can('view', 'users')
  const canViewStudents = can('view', 'students')
  const canViewFinance = can('view', 'finance')

  return (
    <div className="
      grid grid-cols-1 gap-4
      md:grid-cols-3
    "
    >
      {canViewUsers && (
        <div className="rounded-lg border p-4">
          <h3>Users</h3>
          <p>Total: 45</p>
        </div>
      )}

      {canViewStudents && (
        <div className="rounded-lg border p-4">
          <h3>Students</h3>
          <p>Total: 320</p>
        </div>
      )}

      {canViewFinance && (
        <div className="rounded-lg border p-4">
          <h3>Revenue</h3>
          <p>$12,450</p>
        </div>
      )}
    </div>
  )
}

/**
 * Example 5: Permission-based navigation
 */
export function NavigationExample() {
  const { can } = usePermissions()

  const navItems = [
    { label: 'Users', href: '/users/users', permission: { action: 'view', resource: 'users' } },
    { label: 'Students', href: '/students', permission: { action: 'view', resource: 'students' } },
    { label: 'Finance', href: '/accounting', permission: { action: 'view', resource: 'finance' } },
    { label: 'Settings', href: '/settings', permission: { action: 'view', resource: 'settings' } },
  ]

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const hasPermission = can(item.permission.action, item.permission.resource)

        if (!hasPermission)
          return null

        return (
          <Link
            key={item.href}
            to={item.href}
            className="
              hover:bg-accent
              block rounded-sm px-4 py-2
            "
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * Example 6: Form with permission-based field visibility
 */
export function UserFormExample() {
  const { can } = usePermissions()

  return (
    <form className="space-y-4">
      {/* Basic fields - always visible */}
      <div>
        <label htmlFor="user-name">Name</label>
        <input
          id="user-name"
          type="text"
          className="w-full rounded-sm border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="user-email">Email</label>
        <input
          id="user-email"
          type="email"
          className="w-full rounded-sm border px-3 py-2"
        />
      </div>

      {/* Role assignment - only for users with role management permission */}
      {can('edit', 'roles') && (
        <div>
          <label htmlFor="user-roles">Assign Roles</label>
          <select id="user-roles" className="w-full rounded-sm border px-3 py-2">
            <option>Administrator</option>
            <option>Teacher</option>
            <option>Registrar</option>
          </select>
        </div>
      )}

      {/* Status field - only for admins */}
      {can('delete', 'users') && (
        <div>
          <label htmlFor="user-status">Status</label>
          <select
            id="user-status"
            className="w-full rounded-sm border px-3 py-2"
          >
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </select>
        </div>
      )}

      <Button type="submit">
        {can('edit', 'users') ? 'Update User' : 'View User'}
      </Button>
    </form>
  )
}
