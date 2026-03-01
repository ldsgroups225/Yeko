import type { ColumnDef } from '@tanstack/react-table'
import type { ClassItem } from './types'
import {
  IconBook,
  IconDots,
  IconPencil,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { useMemo } from 'react'
import { useTranslations } from '@/i18n'

interface UseClassesTableColumnsProps {
  selectedRows: string[]
  handleSelectAll: (checked: boolean) => void
  handleSelectRow: (id: string, checked: boolean) => void
  setClassToEdit: (item: ClassItem) => void
  setIsEditDialogOpen: (open: boolean) => void
  setClassToDelete: (item: ClassItem) => void
}

export function useClassesTableColumns({
  selectedRows,
  handleSelectAll,
  handleSelectRow,
  setClassToEdit,
  setIsEditDialogOpen,
  setClassToDelete,
}: UseClassesTableColumnsProps) {
  const t = useTranslations()

  return useMemo<ColumnDef<ClassItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={value => handleSelectAll(!!value)}
            aria-label={t.common.selectAll()}
            className="
              border-primary/50
              data-[state=checked]:border-primary
              translate-y-[2px]
            "
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.includes(row.original.class.id)}
            onCheckedChange={value =>
              handleSelectRow(row.original.class.id, !!value)}
            aria-label={t.common.selectRow()}
            className="
              border-primary/50
              data-[state=checked]:border-primary
              translate-y-[2px]
            "
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: row =>
          `${row.grade.name} ${row.series?.name || ''} ${row.class.section}`,
        id: 'name',
        header: t.classes.name(),
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.grade.name}
            {' '}
            {row.original.series?.name}
            {' '}
            <span className="text-muted-foreground">
              {row.original.class.section}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'classroom.name',
        header: t.classes.room(),
        cell: ({ row }) => row.original.classroom?.name || '-',
      },
      {
        id: 'students',
        header: t.classes.students(),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <IconUsers className="text-muted-foreground h-3 w-3" />
            <span>
              {row.original.studentsCount}
              {' '}
              /
              {row.original.class.maxStudents}
            </span>
          </div>
        ),
      },
      {
        id: 'subjects',
        header: t.classes.subjects(),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <IconBook className="text-muted-foreground h-3 w-3" />
            <span>{row.original.subjectsCount}</span>
          </div>
        ),
      },
      {
        accessorKey: 'homeroomTeacher.name',
        header: t.classes.homeroomTeacher(),
        cell: ({ row }) => row.original.homeroomTeacher?.name || '-',
      },
      {
        accessorKey: 'class.status',
        header: t.classes.status(),
        cell: ({ row }) => {
          const status = row.original.class.status
          return (
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status === 'active' ? t.common.active() : t.common.archived()}
            </Badge>
          )
        },
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
                onClick={(e) => {
                  e.stopPropagation()
                  setClassToEdit(row.original)
                  setIsEditDialogOpen(true)
                }}
              >
                <IconPencil className="mr-2 h-4 w-4" />
                {t.common.edit()}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="
                  text-destructive
                  focus:text-destructive
                "
                onClick={() => setClassToDelete(row.original)}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                {t.common.delete()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, selectedRows, handleSelectRow, handleSelectAll, setClassToEdit, setIsEditDialogOpen, setClassToDelete],
  )
}
