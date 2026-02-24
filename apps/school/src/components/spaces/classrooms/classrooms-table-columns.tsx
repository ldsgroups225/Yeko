import type { ColumnDef } from '@tanstack/react-table'
import type { ClassroomItem } from './types'
import {
  IconDots,
  IconStack2,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { useMemo } from 'react'
import { useTranslations } from '@/i18n'

interface UseClassroomsTableColumnsProps {
  setItemToDelete: (item: ClassroomItem | null) => void
}

export function useClassroomsTableColumns({
  setItemToDelete,
}: UseClassroomsTableColumnsProps) {
  const t = useTranslations()

  return useMemo<ColumnDef<ClassroomItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nom',
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-foreground">
              {row.original.name}
            </div>
            <div className="font-mono text-xs font-medium text-muted-foreground">
              {row.original.code}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            <span className="capitalize">{row.original.type}</span>
          </Badge>
        ),
      },
      {
        accessorKey: 'capacity',
        header: 'Capacité',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-muted/20">
              <IconUsers className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <span className="font-medium tabular-nums">
              {row.original.capacity}
            </span>
          </div>
        ),
      },
      {
        id: 'assigned',
        header: 'Classes assignées',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-muted/20">
              <IconStack2 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <span className="font-medium tabular-nums">
              {row.original.assignedClassesCount ?? 0}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <Badge
              variant={status === 'active' ? 'default' : 'secondary'}
              className={`rounded-lg capitalize transition-colors ${
                status === 'active'
                  ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {status === 'active'
                ? 'Actif'
                : status === 'maintenance'
                  ? 'Maintenance'
                  : 'Inactif'}
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
                  className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
              className="backdrop-blur-xl bg-card/95 border-border/40 shadow-xl rounded-xl p-1"
            >
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
                onClick={() => setItemToDelete(row.original)}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                {t.common.delete()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, setItemToDelete],
  )
}
