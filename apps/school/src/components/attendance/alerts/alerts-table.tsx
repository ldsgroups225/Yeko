import type { ColumnDef } from "@tanstack/react-table";
import { IconBell, IconCheck, IconDots, IconX } from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useMemo } from "react";
import { AlertSeverityBadge } from "@/components/attendance/alerts/alert-severity-badge";
import { TableSkeleton } from "@/components/hr/table-skeleton";
import { useTranslations } from "@/i18n";

type AlertSeverity = "info" | "warning" | "critical";
type AlertStatus = "active" | "acknowledged" | "resolved" | "dismissed";

export interface AttendanceAlert {
  id: string;
  alertType: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  createdAt: string;
  teacherName?: string | null;
  studentName?: string | null;
  className?: string | null;
}

interface AlertsTableProps {
  alerts: AttendanceAlert[];
  isLoading?: boolean;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function AlertsTable({
  alerts,
  isLoading,
  onAcknowledge,
  onDismiss,
}: AlertsTableProps) {
  const t = useTranslations();

  const columns = useMemo<ColumnDef<AttendanceAlert>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: t.common.date(),
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <div className="flex flex-col">
              <span className="font-medium">{date.toLocaleDateString()}</span>
              <span className="text-xs text-muted-foreground">
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "severity",
        header: t.conduct.form.severity(), // Using similar key or t.alerts.severity() if available, falling back to what likely exists
        cell: ({ row }) => (
          <AlertSeverityBadge severity={row.original.severity} />
        ),
      },
      {
        accessorKey: "title",
        header: t.alerts.title() || "Title",
        cell: ({ row }) => (
          <div className="flex flex-col max-w-[300px]">
            <span className="font-medium truncate" title={row.original.title}>
              {row.original.title}
            </span>
            <span
              className="text-xs text-muted-foreground truncate"
              title={row.original.message}
            >
              {row.original.message}
            </span>
          </div>
        ),
      },
      {
        id: "related",
        header: t.common.relatedTo() || "Concernant",
        cell: ({ row }) => {
          const subject =
            row.original.teacherName ||
            row.original.studentName ||
            row.original.className;
          return subject || <span className="text-muted-foreground">-</span>;
        },
      },
      {
        accessorKey: "status",
        header: t.common.status(),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant="outline"
              className={
                status === "active"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : status === "acknowledged"
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : status === "dismissed"
                      ? "bg-gray-50 text-gray-600 border-gray-200"
                      : ""
              }
            >
              {status === "active"
                ? t.common.active()
                : status === "acknowledged"
                  ? t.alerts.acknowledged()
                  : status === "dismissed"
                    ? t.alerts.dismissed()
                    : status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: t.common.actions(),
        cell: ({ row }) =>
          row.original.status === "active" ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon">
                    <IconDots className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                {onAcknowledge && (
                  <DropdownMenuItem
                    onClick={() => onAcknowledge(row.original.id)}
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    {t.alerts.acknowledge()}
                  </DropdownMenuItem>
                )}
                {onDismiss && (
                  <DropdownMenuItem onClick={() => onDismiss(row.original.id)}>
                    <IconX className="mr-2 h-4 w-4" />
                    {t.alerts.dismiss()}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null,
      },
    ],
    [t, onAcknowledge, onDismiss],
  );

  const table = useReactTable({
    data: alerts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return <TableSkeleton columns={6} rows={5} />;
  }

  if (alerts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconBell className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>{t.alerts.noAlerts()}</EmptyTitle>
          <EmptyDescription>{t.alerts.noAlertsDescription()}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
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
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t.common.previous()}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t.common.next()}
          </Button>
        </div>
      )}
    </div>
  );
}
