import type {
  ColumnDef,
} from '@tanstack/react-table'
import type { Role } from './types'
import { IconDots, IconEdit, IconSearch, IconShield, IconTrash } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import { EmptyState } from '@/components/hr/empty-state'
import { useTranslations } from '@/i18n'
import { useRolesTable } from './roles-table-context'

export function RolesTableContent() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { state } = useRolesTable()
  const { rolesData, filters, searchInput } = state

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t.hr.roles.name(),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconShield className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                {row.original.name}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                {row.original.slug}
              </span>
            </div>
            {row.original.isSystemRole && (
              <Badge
                variant="secondary"
                className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors"
              >
                {t.hr.roles.system()}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: t.hr.roles.description(),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
            {row.original.description || t.common.none()}
          </span>
        ),
      },
      {
        accessorKey: 'permissionCount',
        header: t.hr.roles.permissions(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/40 font-medium">
              {row.original.permissionCount}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {t.hr.roles.permissionsCount({
                count: row.original.permissionCount,
              })}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'userCount',
        header: t.hr.roles.users(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="font-medium">{row.original.userCount || 0}</span>
            <span className="text-xs text-muted-foreground">
              {t.hr.roles.users()}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  <IconDots className="h-4 w-4" />
                </Button>
              )}
            />
            <DropdownMenuContent
              align="end"
              className="backdrop-blur-2xl bg-popover/90 border-border/40 min-w-[160px]"
            >
              {!row.original.isSystemRole && row.original.slug !== 'school_founder' && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() =>
                      navigate({ to: `/users/roles/${row.original.id}/edit` })}
                  >
                    <IconEdit className="h-4 w-4" />
                    {t.common.edit()}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                    <IconTrash className="h-4 w-4" />
                    {t.common.delete()}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate],
  )

  const table = useReactTable({
    data: rolesData?.roles || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: rolesData?.totalPages || 0,
  })

  const hasNoData = !rolesData?.roles || rolesData.roles.length === 0
  const hasNoResults = hasNoData && (searchInput || filters.scope)

  if (hasNoData && !hasNoResults) {
    return (
      <div className="py-12">
        <EmptyState
          icon={IconShield}
          title={t.hr.roles.noRoles()}
          description={t.hr.roles.noRolesDescription()}
          action={{
            label: t.hr.roles.addRole(),
            onClick: () => navigate({ to: '/users/roles/new' }),
          }}
        />
      </div>
    )
  }

  if (hasNoResults) {
    return (
      <div className="py-12">
        <EmptyState
          icon={IconSearch}
          title={t.common.noResults()}
          description={t.common.noResultsDescription()}
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/40 bg-background/30 overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50 backdrop-blur-md">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent border-border/40"
            >
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className="text-xs uppercase tracking-wider font-semibold py-4"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {table.getRowModel().rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.03,
                  ease: 'easeOut',
                }}
                className="group hover:bg-primary/5 transition-colors border-border/40 cursor-pointer"
                onClick={() =>
                  navigate({ to: `/users/roles/${row.original.id}` })}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="py-4">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  )
}
