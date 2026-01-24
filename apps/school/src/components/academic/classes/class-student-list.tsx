import { IconDots, IconUser, IconUsers } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
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
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { enrollmentsOptions } from '@/lib/queries/enrollments'
import { generateUUID } from '@/utils/generateUUID'

interface ClassStudentListProps {
  classId: string
}

export function ClassStudentList({ classId }: ClassStudentListProps) {
  const t = useTranslations()

  const { data, isLoading } = useQuery({
    ...enrollmentsOptions.list({ classId, status: 'confirmed', limit: 100 }),
    enabled: !!classId,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map(() => (
          <div
            key={generateUUID()}
            className="flex items-center gap-4 p-4 border rounded-xl border-border/40"
          >
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/6" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    )
  }

  const enrollments = data?.data || []

  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-card/50 rounded-xl border border-dashed border-border/40">
        <IconUsers className="size-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold">{t.classes.noStudents()}</h3>
        <p className="text-sm text-muted-foreground">
          This class has no confirmed enrollments yet.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-card/20">
          <TableRow className="hover:bg-transparent border-border/40">
            <TableHead className="text-foreground font-semibold">
              {t.enrollments.student()}
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              {t.enrollments.rollNumber()}
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              {t.common.status()}
            </TableHead>
            <TableHead className="w-[70px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((item, index) => (
            <motion.tr
              key={item.enrollment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="border-border/10 group hover:bg-card/30 transition-colors"
            >
              <TableCell className="py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 border border-border/40">
                    <AvatarImage src={item.student?.photoUrl || undefined} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs">
                      {item.student?.firstName?.[0]}
                      {item.student?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      to="/students/$studentId"
                      params={{ studentId: item.student?.id }}
                      className="font-medium hover:underline text-sm"
                    >
                      {item.student?.lastName}
                      {' '}
                      {item.student?.firstName}
                    </Link>
                    <p className="text-xs text-muted-foreground font-mono">
                      {item.student?.matricule}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">
                  {item.enrollment.rollNumber || '-'}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase font-bold tracking-wider"
                >
                  {t.enrollments.statusConfirmed()}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={(
                      <Button variant="ghost" size="icon" className="size-8">
                        <IconDots className="size-4" />
                      </Button>
                    )}
                  />
                  <DropdownMenuContent
                    align="end"
                    className="backdrop-blur-xl bg-popover/90 border border-border/40"
                  >
                    <DropdownMenuItem
                      render={(
                        <Link
                          to="/students/$studentId"
                          params={{ studentId: item.student?.id }}
                        >
                          <IconUser className="mr-2 size-4" />
                          {t.enrollments.viewStudent()}
                        </Link>
                      )}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
