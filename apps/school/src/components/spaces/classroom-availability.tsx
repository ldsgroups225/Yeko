import { IconBuilding } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@workspace/ui/components/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Progress } from '@workspace/ui/components/progress'
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
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { useTranslations } from '@/i18n'
import { getClassrooms } from '@/school/functions/classrooms'
import { ClassroomEmptyState } from './classroom-empty-state'
import { ClassroomStatsCards } from './classroom-stats-cards'

export function ClassroomAvailability() {
  const t = useTranslations()

  const { data: classrooms, isPending } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => getClassrooms({ data: {} }),
  })

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-40 w-full rounded-3xl" />
          ))}
        </div>
        <TableSkeleton columns={5} rows={5} />
      </div>
    )
  }

  const classroomList = classrooms?.success ? classrooms.data : []

  if (classroomList.length === 0) {
    return <ClassroomEmptyState />
  }

  const availableCount = classroomList.filter(
    c => c.assignedClassesCount === 0 && c.status === 'active',
  ).length
  const occupiedCount = classroomList.filter(
    c => c.assignedClassesCount > 0,
  ).length
  const maintenanceCount = classroomList.filter(
    c => c.status === 'maintenance',
  ).length
  const inactiveCount = classroomList.filter(
    c => c.status === 'inactive',
  ).length

  return (
    <div
      className="space-y-8"
      role="region"
      aria-label="Disponibilité des salles de classe"
    >
      <ClassroomStatsCards
        available={availableCount}
        occupied={occupiedCount}
        maintenance={maintenanceCount}
        inactive={inactiveCount}
      />

      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/5">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <IconBuilding className="h-5 w-5 text-primary" />
            {t.spaces.classrooms.details()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="font-semibold text-muted-foreground pl-6">
                  {t.spaces.classrooms.classroom()}
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  {t.spaces.classrooms.type()}
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  {t.spaces.classrooms.occupation()}
                </TableHead>
                <TableHead className="w-[150px] text-right font-semibold text-muted-foreground pr-6">
                  {t.common.status()}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classroomList.map((item, index) => {
                const isAvailable
                  = item.assignedClassesCount === 0
                    && item.status === 'active'
                const occupancyPercent
                  = item.capacity > 0
                    ? Math.min(100, (item.assignedClassesCount / 1) * 100)
                    : 0

                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/30 border-border/40 transition-colors"
                  >
                    <TableCell className="pl-6">
                      <div>
                        <div className="font-bold text-foreground">
                          {item.name}
                        </div>
                        <div className="font-mono text-xs font-medium text-muted-foreground">
                          {item.code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-medium capitalize"
                      >
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 max-w-[300px]">
                        <Progress
                          value={occupancyPercent}
                          className="h-2 flex-1 rounded-full bg-muted/50"
                          // indicatorClassName={isAvailable ? "bg-green-500" : "bg-blue-500"} // Custom prop if available, or class override
                        />
                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {item.assignedClassesCount}
                          {' '}
                          {t.spaces.classrooms.classes()}
                          {' '}
                          /
                          {' '}
                          {item.capacity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {isAvailable
                        ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200 dark:border-green-800 dark:text-green-400 rounded-lg"
                            >
                              {t.spaces.classrooms.available()}
                            </Badge>
                          )
                        : item.status !== 'active'
                          ? (
                              <Badge
                                variant="secondary"
                                className="bg-muted text-muted-foreground rounded-lg"
                              >
                                {item.status === 'maintenance'
                                  ? t.spaces.classrooms.maintenance()
                                  : t.spaces.classrooms.inactive()}
                              </Badge>
                            )
                          : (
                              <Badge
                                variant="default"
                                className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                              >
                                {t.spaces.classrooms.occupied()}
                              </Badge>
                            )}
                    </TableCell>
                  </motion.tr>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
