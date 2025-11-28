import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { getTeachers } from '@/school/functions/teachers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Edit, Trash2, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { format } from 'date-fns';

interface Teacher {
  id: string;
  user: {
    name: string;
    email: string;
  };
  specialization: string | null;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: Date | null;
  subjects: string[];
}

interface TeachersTableProps {
  filters: {
    page?: number;
    search?: string;
    subjectId?: string;
    status?: 'active' | 'inactive' | 'on_leave';
  };
}

export function TeachersTable({ filters }: TeachersTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const result = await getTeachers({
        data: {
          filters: {
            search: debouncedSearch,
            subjectId: filters.subjectId,
            status: filters.status,
          },
          pagination: {
            page: filters.page || 1,
            limit: 20,
          },
        },
      });
      return result;
    },
  });

  const columns = useMemo<ColumnDef<Teacher>[]>(
    () => [
      {
        accessorKey: 'user.name',
        header: t('hr.teachers.name'),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.user.name}</div>
        ),
      },
      {
        accessorKey: 'user.email',
        header: t('hr.teachers.email'),
        cell: ({ row }) => row.original.user.email,
      },
      {
        accessorKey: 'subjects',
        header: t('hr.teachers.subjects'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.subjects && row.original.subjects.length > 0 ? (
              row.original.subjects.slice(0, 3).map((subject, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
            {row.original.subjects && row.original.subjects.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{row.original.subjects.length - 3}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'specialization',
        header: t('hr.teachers.specialization'),
        cell: ({ row }) => row.original.specialization || '-',
      },
      {
        accessorKey: 'status',
        header: t('hr.teachers.status'),
        cell: ({ row }) => {
          const status = row.original.status;
          const variants = {
            active: 'default',
            inactive: 'secondary',
            on_leave: 'outline',
          } as const;
          return (
            <Badge variant={variants[status]}>
              {t(`hr.status.${status}`)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'hireDate',
        header: t('hr.teachers.hireDate'),
        cell: ({ row }) =>
          row.original.hireDate
            ? format(new Date(row.original.hireDate), 'dd/MM/yyyy')
            : '-',
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate({ to: `/app/hr/teachers/${row.original.id}` })}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t('common.view')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate({ to: `/app/hr/teachers/${row.original.id}/edit` })
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate]
  );

  const table = useReactTable({
    data: data?.teachers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('hr.teachers.searchPlaceholder')}
            value={searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchInput(e.target.value)
            }
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t('hr.teachers.noTeachers')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('common.showing')} {(data.page - 1) * data.limit + 1} -{' '}
            {Math.min(data.page * data.limit, data.total)} {t('common.of')} {data.total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate({
                  to: '/app/hr/teachers',
                  search: { ...filters, page: data.page - 1 },
                })
              }
              disabled={data.page === 1}
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate({
                  to: '/app/hr/teachers',
                  search: { ...filters, page: data.page + 1 },
                })
              }
              disabled={data.page === data.totalPages}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
