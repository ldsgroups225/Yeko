import type { Table as TanstackTable } from '@tanstack/react-table'
import type { IconUser } from './users-table-columns'
import { useNavigate } from '@tanstack/react-router'
import {
  flexRender,

} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'

interface UsersTableRendererProps {
  table: TanstackTable<IconUser>
}

export function UsersTableRenderer({ table }: UsersTableRendererProps) {
  const navigate = useNavigate()

  return (
    <div className="
      border-border/40 bg-background/30 overflow-hidden rounded-xl
      border
    "
    >
      <Table>
        <TableHeader className="bg-muted/50 backdrop-blur-md">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow
              key={headerGroup.id}
              className="
                border-border/40
                hover:bg-transparent
              "
            >
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className="
                    py-4 text-xs font-semibold tracking-wider uppercase
                  "
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
                className="
                  group
                  hover:bg-primary/5
                  border-border/40 cursor-pointer transition-colors
                "
                onClick={() =>
                  navigate({ to: `/settings/personnel/users/${row.original.id}` })}
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
