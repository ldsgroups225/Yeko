import type { School } from '@repo/data-ops'
import {
  IconBan,
  IconDots,
  IconEye,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconUsers,
} from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { buttonVariants } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { useRef } from 'react'
import { schoolQueryOptions } from '@/integrations/tanstack-query/schools-options'

interface SchoolsTableVirtualProps {
  schools: School[]
  onSchoolClick?: (schoolId: string) => void
}

export function SchoolsTableVirtual({
  schools,
  onSchoolClick,
}: SchoolsTableVirtualProps) {
  const queryClient = useQueryClient()
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: schools.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73, // Estimated row height in pixels
    overscan: 5, // Number of items to render outside visible area
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspendue</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handlePrefetchSchool = (schoolId: string) => {
    void queryClient.prefetchQuery(schoolQueryOptions(schoolId))
  }

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto rounded-lg border">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        <Table>
          <TableHeader className="bg-background sticky top-0 z-10">
            <TableRow>
              <TableHead>École</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const school = schools[virtualRow.index]
              if (!school)
                return null

              return (
                <TableRow
                  key={school.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="cursor-pointer"
                  onClick={() => onSchoolClick?.(school.id)}
                  onMouseEnter={() => handlePrefetchSchool(school.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage
                          src={school.logoUrl || undefined}
                          alt={school.name}
                        />
                        <AvatarFallback className="
                          bg-primary/10 text-primary rounded-lg font-medium
                        "
                        >
                          {school.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{school.name}</div>
                        {school.address && (
                          <div className="
                            text-muted-foreground flex items-center gap-1
                            text-xs
                          "
                          >
                            <IconMapPin className="h-3 w-3" />
                            {school.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="
                      bg-muted rounded-sm px-2 py-1 font-mono text-xs
                    "
                    >
                      {school.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {school.email && (
                        <div className="flex items-center gap-1 text-xs">
                          <IconMail className="text-muted-foreground h-3 w-3" />
                          {school.email}
                        </div>
                      )}
                      {school.phone && (
                        <div className="flex items-center gap-1 text-xs">
                          <IconPhone className="text-muted-foreground h-3 w-3" />
                          {school.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(school.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={(
                          <button
                            type="button"
                            className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8' })}
                            onClick={e => e.stopPropagation()}
                          >
                            <IconDots className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </button>
                        )}
                      />
                      <DropdownMenuContent
                        align="end"
                        onClick={e => e.stopPropagation()}
                      >
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          render={(
                            <Link
                              to="/app/schools/$schoolId"
                              params={{ schoolId: school.id }}
                              onMouseEnter={() => handlePrefetchSchool(school.id)}
                            >
                              <IconEye className="mr-2 h-4 w-4" />
                              {' '}
                              Voir détails
                            </Link>
                          )}
                        />
                        <DropdownMenuItem
                          render={(
                            <Link
                              to="/app/schools/$schoolId"
                              params={{ schoolId: school.id }}
                              search={{ tab: 'users' }}
                              onMouseEnter={() => handlePrefetchSchool(school.id)}
                            >
                              <IconUsers className="mr-2 h-4 w-4" />
                              {' '}
                              Gérer
                              utilisateurs
                            </Link>
                          )}
                        />
                        <DropdownMenuItem
                          render={(
                            <Link
                              to="/app/schools/$schoolId"
                              params={{ schoolId: school.id }}
                              search={{ edit: true }}
                              onMouseEnter={() => handlePrefetchSchool(school.id)}
                            >
                              <IconPencil className="mr-2 h-4 w-4" />
                              {' '}
                              Modifier
                            </Link>
                          )}
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="
                          text-destructive
                          focus:text-destructive
                        "
                        >
                          <IconBan className="mr-2 h-4 w-4" />
                          {' '}
                          Suspendre
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
