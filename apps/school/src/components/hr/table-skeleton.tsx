import { motion } from 'motion/react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { generateUUID } from '@/utils/generateUUID'

interface TableSkeletonProps {
  columns?: number
  rows?: number
}

export function TableSkeleton({ columns = 6, rows = 5 }: TableSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Search and Filters Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50 backdrop-blur-md">
            <TableRow className="hover:bg-transparent border-border/40">
              {Array.from({ length: columns }).map(() => (
                <TableHead key={generateUUID()}>
                  <Skeleton className="h-4 w-24 opacity-60" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }, (_, i) => `row-${i}`).map((rowKey, rowIndex) => (
              <motion.tr
                key={rowKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.03 }}
                className="border-border/40"
              >
                {Array.from({ length: columns }, (_, i) => `${rowKey}-col-${i}`).map(cellKey => (
                  <TableCell key={cellKey}>
                    <Skeleton className="h-4 w-full opacity-40" />
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-4 w-40 opacity-50" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </motion.div>
  )
}
