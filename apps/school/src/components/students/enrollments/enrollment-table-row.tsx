import type { EnrollmentWithDetails } from '@repo/data-ops/queries/enrollments'
import { IconCheck, IconDots, IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { TableCell } from '@workspace/ui/components/table'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

const statusColors: Record<string, string> = {
  pending: 'bg-accent/10 text-accent-foreground',
  confirmed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
  transferred: 'bg-secondary/10 text-secondary',
}

interface EnrollmentTableRowProps {
  item: EnrollmentWithDetails
  index: number
  onConfirm: (id: string) => void
  onCancel: (enrollment: EnrollmentWithDetails) => void
  isConfirming: boolean
}

export function EnrollmentTableRow({
  item,
  index,
  onConfirm,
  onCancel,
  isConfirming,
}: EnrollmentTableRowProps) {
  const t = useTranslations()

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="border-b"
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={item.student?.photoUrl || undefined} />
            <AvatarFallback>
              {item.student?.firstName?.[0]}
              {item.student?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              to="/students/$studentId"
              params={{ studentId: item.student?.id }}
              className="
                font-medium
                hover:underline
              "
            >
              {item.student?.lastName}
              {' '}
              {item.student?.firstName}
            </Link>
            <p className="text-muted-foreground font-mono text-sm">
              {item.student?.matricule}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {item.class?.gradeName}
        {' '}
        {item.class?.section}
        {item.class?.seriesName && (
          <span className="text-muted-foreground">
            {' '}
            (
            {item.class.seriesName}
            )
          </span>
        )}
      </TableCell>
      <TableCell>
        {item.enrollment.enrollmentDate
          ? new Date(item.enrollment.enrollmentDate).toLocaleDateString('fr-FR')
          : '-'}
      </TableCell>
      <TableCell>{item.enrollment.rollNumber || '-'}</TableCell>
      <TableCell>
        <Badge className={statusColors[item.enrollment.status]}>
          {{
            pending: t.enrollments.statusPending,
            confirmed: t.enrollments.statusConfirmed,
            cancelled: t.enrollments.statusCancelled,
            transferred: t.enrollments.statusTransferred,
          }[
            item.enrollment.status as
            | 'pending'
            | 'confirmed'
            | 'cancelled'
            | 'transferred'
          ]()}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <IconDots className="h-4 w-4" />
              </Button>
            )}
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={(
                <Link
                  to="/students/$studentId"
                  params={{ studentId: item.student?.id }}
                >
                  {t.enrollments.viewStudent()}
                </Link>
              )}
            />
            {item.enrollment.status === 'pending' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onConfirm(item.enrollment.id)}
                  disabled={isConfirming}
                >
                  <IconCheck className="text-success mr-2 h-4 w-4" />
                  {t.enrollments.confirm()}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onCancel(item)}
                >
                  <IconX className="mr-2 h-4 w-4" />
                  {t.enrollments.cancel()}
                </DropdownMenuItem>
              </>
            )}
            {item.enrollment.status === 'confirmed' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onCancel(item)}
                >
                  <IconX className="mr-2 h-4 w-4" />
                  {t.enrollments.cancel()}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  )
}
