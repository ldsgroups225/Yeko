import type { ColumnDef } from '@tanstack/react-table'
import { IconBriefcase, IconCalendar, IconDots, IconEdit, IconEye, IconMail, IconSearch, IconTrash } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Input } from '@workspace/ui/components/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/hr/empty-state'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslations } from '@/i18n'
import { getStaffList } from '@/school/functions/staff'

type StaffListResponse = Awaited<ReturnType<typeof getStaffList>>
type StaffMember = StaffListResponse['staff'][number]

interface StaffTableProps {
  filters: {
    page?: number
    search?: string
    position?: string
    status?: 'active' | 'inactive' | 'on_leave'
  }
}

export function StaffTable({ filters }: StaffTableProps) {
  const t = useTranslations()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 500)

  const { data, isLoading } = useQuery({
    queryKey: ['staff', { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const result = await getStaffList({
        data: {
          filters: {
            search: debouncedSearch,
            position: filters.position,
            status: filters.status,
          },
          pagination: {
            page: filters.page || 1,
            limit: 20,
          },
        },
      })
      return result
    },
  })

  const columns = useMemo<ColumnDef<StaffMember>[]>(
    () => [
      {
        accessorKey: 'user.name',
        header: t.hr.staff.name(),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{row.original.user.name}</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <IconMail className="h-3 w-3" />
              {row.original.user.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'position',
        header: t.hr.staff.position(),
        cell: ({ row }) => {
          const positionTranslations = {
            academic_coordinator: t.hr.positions.academic_coordinator,
            discipline_officer: t.hr.positions.discipline_officer,
            accountant: t.hr.positions.accountant,
            cashier: t.hr.positions.cashier,
            registrar: t.hr.positions.registrar,
            other: t.hr.positions.other,
          }
          return (
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-muted/50 border border-border/40 text-xs font-medium">
              <IconBriefcase className="h-3 w-3 text-primary" />
              {positionTranslations[
                row.original.position as keyof typeof positionTranslations
              ]()}
            </div>
          )
        },
      },
      {
        accessorKey: 'department',
        header: t.hr.staff.department(),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {row.original.department || t.common.none()}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t.hr.staff.status(),
        cell: ({ row }) => {
          const status = row.original.status
          const variants = {
            active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            inactive: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
            on_leave: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          } as const
          return (
            <Badge variant="outline" className={`rounded-full border ${variants[status]} transition-colors`}>
              {{
                active: t.hr.status.active,
                inactive: t.hr.status.inactive,
                on_leave: t.hr.status.on_leave,
              }[status]()}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'hireDate',
        header: t.hr.staff.hireDate(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconCalendar className="h-3.5 w-3.5" />
            {row.original.hireDate
              ? format(new Date(row.original.hireDate), 'dd MMM yyyy')
              : '-'}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors">
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="backdrop-blur-2xl bg-popover/90 border-border/40 min-w-[160px]">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => navigate({ to: `/users/staff/${row.original.id}` })}
              >
                <IconEye className="h-4 w-4" />
                {t.common.view()}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() =>
                  navigate({ to: `/users/staff/${row.original.id}/edit` })}
              >
                <IconEdit className="h-4 w-4" />
                {t.common.edit()}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                <IconTrash className="h-4 w-4" />
                {t.common.delete()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate],
  )

  const table = useReactTable({
    data: data?.staff || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  })

  if (isLoading) {
    return <TableSkeleton columns={6} rows={5} />
  }

  const hasNoData = !data?.staff || data.staff.length === 0
  const hasNoResults = hasNoData && (debouncedSearch || filters.position || filters.status)

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl font-serif">{t.hr.staff.listTitle()}</CardTitle>
            <div className="relative w-full sm:w-72">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.hr.staff.searchPlaceholder()}
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchInput(e.target.value)}
                className="pl-10 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Empty State */}
          {hasNoData && !hasNoResults && (
            <div className="py-12">
              <EmptyState
                icon={IconBriefcase}
                title={t.hr.staff.noStaff()}
                description={t.hr.staff.noStaffDescription()}
                action={{
                  label: t.hr.staff.addStaff(),
                  onClick: () => navigate({ to: '/users/staff/new' }),
                }}
              />
            </div>
          )}

          {/* No Results State */}
          {hasNoResults && (
            <div className="py-12">
              <EmptyState
                icon={IconSearch}
                title={t.common.noResults()}
                description={t.common.noResultsDescription()}
              />
            </div>
          )}

          {/* Table */}
          {!hasNoData && (
            <div className="rounded-xl border border-border/40 bg-background/30 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50 backdrop-blur-md">
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/40">
                      {headerGroup.headers.map(header => (
                        <TableHead key={header.id} className="text-xs uppercase tracking-wider font-semibold py-4">
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
                        transition={{ duration: 0.2, delay: index * 0.03, ease: 'easeOut' }}
                        className="group hover:bg-primary/5 transition-colors border-border/40 cursor-pointer"
                        onClick={() => navigate({ to: `/users/staff/${row.original.id}` })}
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id} className="py-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!hasNoData && data && data.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-sm text-muted-foreground font-medium">
                {t.common.showing()}
                {' '}
                <span className="text-foreground">{(data.page - 1) * data.limit + 1}</span>
                {' '}
                -
                {' '}
                <span className="text-foreground">{Math.min(data.page * data.limit, data.total)}</span>
                {' '}
                {t.common.of()}
                {' '}
                <span className="text-foreground">{data.total}</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border/40 bg-background/50 hover:bg-background transition-all px-4"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate({
                      to: '/users/staff',
                      search: { ...filters, page: data.page - 1 },
                    })
                  }}
                  disabled={data.page === 1}
                >
                  {t.common.previous()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border/40 bg-background/50 hover:bg-background transition-all px-4"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate({
                      to: '/users/staff',
                      search: { ...filters, page: data.page + 1 },
                    })
                  }}
                  disabled={data.page === data.totalPages}
                >
                  {t.common.next()}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
