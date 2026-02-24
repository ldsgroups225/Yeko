import { IconUsers } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { flexRender } from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useClassesTable } from './classes-table-context'

export function ClassesTableDesktop() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { state } = useClassesTable()
  const { table, data } = state

  return (
    <div className="hidden rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl md:block overflow-hidden">
      <Table>
        <TableHeader className="bg-card/20">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent border-border/40"
            >
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className="text-foreground font-semibold"
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
          {data?.length === 0
            ? (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-96">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="rounded-full bg-white/10 p-6 backdrop-blur-xl mb-4">
                        <IconUsers className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-semibold">
                        {t.tables.noClassesFound()}
                      </h3>
                      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                        {t.tables.createFirstClass()}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )
            : (
                <AnimatePresence>
                  {table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-border/10 group hover:bg-card/30 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate({ to: `/classes/${row.original.class.id}` })}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
        </TableBody>
      </Table>
    </div>
  )
}
