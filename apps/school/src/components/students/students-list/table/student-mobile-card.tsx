import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@workspace/ui/components/dropdown-menu'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useStudentsList } from '../students-list-context'
import { StudentStatusBadge } from './student-status'

interface StudentMobileCardProps {
  item: any
  index: number
}

export function StudentMobileCard({ item, index }: StudentMobileCardProps) {
  const t = useTranslations()
  const { state, actions } = useStudentsList()
  const { selectedRows } = state
  const { handleSelectRow, handleDelete, handleStatusChange, handlePrefetchStudent } = actions

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className="
        border-border/40 bg-card/50 rounded-xl border p-4 shadow-sm
        backdrop-blur-xl
      "
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedRows.includes(item.student.id)}
            onCheckedChange={checked => handleSelectRow(item.student.id, !!checked)}
            className="
              border-primary/50
              data-[state=checked]:border-primary
              mr-2
            "
          />
          <Link
            to="/students/$studentId"
            params={{ studentId: item.student.id }}
            className="flex items-center gap-3"
            onMouseEnter={() => handlePrefetchStudent(item.student.id)}
          >
            <Avatar className="border-border/20 h-12 w-12 border-2">
              <AvatarImage src={item.student.photoUrl || undefined} />
              <AvatarFallback>
                {item.student.firstName[0]}
                {item.student.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-foreground font-medium">
                {item.student.lastName}
                {' '}
                {item.student.firstName}
              </p>
              <p className="text-muted-foreground font-mono text-xs">{item.student.matricule}</p>
            </div>
          </Link>
        </div>
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
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StudentStatusBadge status={item.student.status} />
        {item.currentClass?.gradeName && item.currentClass?.section && (
          <Badge
            variant="outline"
            className="border-border/40 bg-card/20 backdrop-blur-md"
          >
            {item.currentClass.gradeName}
            {' '}
            {item.currentClass.section}
          </Badge>
        )}
        <span className="
          text-muted-foreground bg-card/20 ml-auto rounded-full px-2 py-0.5
          text-xs font-medium
        "
        >
          {item.student.gender === 'M' ? t.students.male() : item.student.gender === 'F' ? t.students.female() : ''}
        </span>
      </div>
    </motion.div>
  )
}
