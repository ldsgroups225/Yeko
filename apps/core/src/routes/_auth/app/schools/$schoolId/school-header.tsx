import type { DateFormatStyle } from '@repo/data-ops'
import { IconArrowLeft, IconBuilding, IconCircleCheck, IconCircleX, IconClock, IconDotsVertical, IconEdit } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'

interface SchoolHeaderProps {
  school: {
    id: string
    name: string
    code: string
    status: string
    createdAt: Date | string
  }
  formatDate: (date: Date | string, style?: DateFormatStyle) => string
  onDelete: () => void
}

export function SchoolHeader({ school, formatDate, onDelete }: SchoolHeaderProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default">
            <IconCircleCheck className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )
      case 'inactive':
        return (
          <Badge variant="secondary">
            <IconClock className="mr-1 h-3 w-3" />
            Inactive
          </Badge>
        )
      case 'suspended':
        return (
          <Badge variant="destructive">
            <IconCircleX className="mr-1 h-3 w-3" />
            Suspendue
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="
      flex flex-col gap-4
      md:flex-row md:items-center md:justify-between
    "
    >
      <div className="flex items-center gap-4">
        <Link to="/app/schools">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <IconArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="
            bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg
          "
          >
            <IconBuilding className="text-primary h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{school.name}</h1>
              {getStatusBadge(school.status)}
            </div>
            <div className="
              text-muted-foreground flex items-center gap-2 text-sm
            "
            >
              <span className="
                bg-muted rounded-sm px-2 py-0.5 font-mono text-xs
              "
              >
                {school.code}
              </span>
              <span>•</span>
              <span>
                Rejoint le
                <span className="ml-1 capitalize">{formatDate(school.createdAt, 'MEDIUM')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/app/schools/$schoolId/edit" params={{ schoolId: school.id }}>
          <Button variant="outline" className="gap-2">
            <IconEdit className="h-4 w-4" />
            Modifier
          </Button>
        </Link>
        <Button variant="destructive" className="gap-2" onClick={onDelete}>
          <IconCircleX className="h-4 w-4" />
          Supprimer
        </Button>
        <Button variant="ghost" size="icon">
          <IconDotsVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
