import { formatDate } from '@repo/data-ops'
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@workspace/ui/components/dropdown-menu'
import { TableCell } from '@workspace/ui/components/table'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useStudentsList } from '../students-list-context'
import { StudentStatusBadge } from './student-status'

interface StudentTableRowProps {
  item: any
  index: number
}

export function StudentTableRow({ item, index }: StudentTableRowProps) {
  const t = useTranslations()
  const navigate = useNavigate()
  const { state, actions } = useStudentsList()
  const { selectedRows } = state
  const { handleSelectRow, handleDelete, handleStatusChange, handlePrefetchStudent } = actions

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.02 }}
      className="
        border-border/10 group
        hover:bg-card/30
        cursor-pointer transition-colors
      "
      onClick={() => navigate({ to: '/students/$studentId', params: { studentId: item.student.id } })}
      onMouseEnter={() => handlePrefetchStudent(item.student.id)}
    >
      <TableCell onClick={e => e.stopPropagation()}>
        <Checkbox
          checked={selectedRows.includes(item.student.id)}
          onCheckedChange={checked => handleSelectRow(item.student.id, !!checked)}
          className="
            border-primary/50
            data-[state=checked]:border-primary
            mr-2
          "
        />
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <Avatar className="border-border/20 h-10 w-10 border">
            <AvatarImage src={item.student.photoUrl || undefined} />
            <AvatarFallback>
              {item.student.firstName[0]}
              {item.student.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              to="/students/$studentId"
              params={{ studentId: item.student.id }}
              className="
                hover:text-primary
                block font-medium transition-colors
              "
              onMouseEnter={() => handlePrefetchStudent(item.student.id)}
            >
              {item.student.lastName}
              {' '}
              {item.student.firstName}
            </Link>
            <p className="text-muted-foreground text-xs">{formatDate(item.student.dob, 'MEDIUM')}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground font-mono text-sm">{item.student.matricule}</TableCell>
      <TableCell>
        {item.currentClass?.gradeName && item.currentClass?.section
          ? (
              <Badge variant="outline" className="bg-card/10 border-border/20">
                {item.currentClass.gradeName}
                {' '}
                {item.currentClass.section}
                {item.currentClass.seriesName && ` (${item.currentClass.seriesName})`}
              </Badge>
            )
          : <span className="text-muted-foreground">-</span>}
      </TableCell>
      <TableCell>{item.student.gender === 'M' ? t.students.male() : item.student.gender === 'F' ? t.students.female() : '-'}</TableCell>
      <TableCell><StudentStatusBadge status={item.student.status} /></TableCell>
      <TableCell className="text-center">
        <span className="
          bg-card/20 inline-flex h-6 w-6 items-center justify-center
          rounded-full px-2 py-0.5 text-xs font-medium
        "
        >
          {item.parentsCount}
        </span>
      </TableCell>
      <TableCell onClick={e => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-card/20"
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
            className="bg-popover/90 border-border/40 border backdrop-blur-xl"
          >
            <DropdownMenuItem
              render={(
                <Link to="/students/$studentId/edit" params={{ studentId: item.student.id }}>
                  <IconEdit className="mr-2 h-4 w-4" />
                  {t.common.edit()}
                </Link>
              )}
            />
            <DropdownMenuItem onClick={() => handleStatusChange(item)}>
              <IconEdit className="mr-2 h-4 w-4" />
              {t.students.changeStatus()}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(item)}
              className="
                text-destructive
                focus:text-destructive
              "
            >
              <IconTrash className="mr-2 h-4 w-4" />
              {t.common.delete()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  )
}
