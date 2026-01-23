import {
  IconBuilding,
  IconCircleCheck,
  IconCircleX,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { motion } from "motion/react";
import { TableSkeleton } from "@/components/hr/table-skeleton";
import { useTranslations } from "@/i18n";
import { getClassrooms } from "@/school/functions/classrooms";

function StatsCards({
  available,
  occupied,
  maintenance,
  inactive,
}: {
  available: number;
  occupied: number;
  maintenance: number;
  inactive: number;
}) {
  const t = useTranslations();

  const stats = [
    {
      title: t.spaces.classrooms.available(),
      value: available,
      icon: IconCircleCheck,
      color: "text-green-600",
      bgColor: "bg-green-500/10 border-green-500/20",
      description: "Prêtes à l'emploi",
    },
    {
      title: t.spaces.classrooms.occupied(),
      value: occupied,
      icon: IconUsers,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10 border-blue-500/20",
      description: "En cours d'utilisation",
    },
    {
      title: t.spaces.classrooms.maintenance(),
      value: maintenance,
      icon: IconBuilding,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10 border-yellow-500/20",
      description: "Intervention requise",
    },
    {
      title: t.spaces.classrooms.inactive(),
      value: inactive,
      icon: IconCircleX,
      color: "text-gray-600",
      bgColor: "bg-gray-500/10 border-gray-500/20",
      description: "Hors service",
    },
  ];

  return (
    <div
      className="grid gap-6 md:grid-cols-4"
      role="list"
      aria-label={t.spaces.classrooms.roomStatistics()}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            role="listitem"
            className={`rounded-3xl border bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 ${stat.bgColor.replace("bg-", "border-").replace("/10", "/20")}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <stat.icon
                    className={`h-4 w-4 ${stat.color}`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <span
                  className="text-3xl font-black tracking-tight"
                  aria-label={`${stat.value} ${stat.title}`}
                >
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-muted-foreground/80">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations();

  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
      <CardContent className="p-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="rounded-full bg-muted/30 p-8 ring-1 ring-border/50">
            <IconBuilding className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{t.empty.noClassrooms()}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t.empty.createClassroomsDescription()}
            </p>
          </div>
          <Button
            render={
              <a href="/spaces/classrooms">
                <IconPlus className="mr-2 h-4 w-4" />
                {t.empty.createClassroom()}
              </a>
            }
            className="mt-4 rounded-xl shadow-lg shadow-primary/20 h-11 px-8"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function ClassroomAvailability() {
  const t = useTranslations();

  const { data: classrooms, isLoading } = useQuery({
    queryKey: ["classrooms"],
    queryFn: () => getClassrooms({ data: {} }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-3xl" />
          ))}
        </div>
        <TableSkeleton columns={5} rows={5} />
      </div>
    );
  }

  const classroomList = classrooms || [];

  if (classroomList.length === 0) {
    return <EmptyState />;
  }

  const availableCount = classroomList.filter(
    (c) => c.assignedClassesCount === 0 && c.classroom.status === "active",
  ).length;
  const occupiedCount = classroomList.filter(
    (c) => c.assignedClassesCount > 0,
  ).length;
  const maintenanceCount = classroomList.filter(
    (c) => c.classroom.status === "maintenance",
  ).length;
  const inactiveCount = classroomList.filter(
    (c) => c.classroom.status === "inactive",
  ).length;

  return (
    <div
      className="space-y-8"
      role="region"
      aria-label="Disponibilité des salles de classe"
    >
      <StatsCards
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
                const isAvailable =
                  item.assignedClassesCount === 0 &&
                  item.classroom.status === "active";
                const occupancyPercent =
                  item.classroom.capacity > 0
                    ? Math.min(100, (item.assignedClassesCount / 1) * 100)
                    : 0;

                return (
                  <motion.tr
                    key={item.classroom.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/30 border-border/40 transition-colors"
                  >
                    <TableCell className="pl-6">
                      <div>
                        <div className="font-bold text-foreground">
                          {item.classroom.name}
                        </div>
                        <div className="font-mono text-xs font-medium text-muted-foreground">
                          {item.classroom.code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-medium capitalize"
                      >
                        {item.classroom.type}
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
                          {item.assignedClassesCount}{" "}
                          {t.spaces.classrooms.classes()} /{" "}
                          {item.classroom.capacity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {isAvailable ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200 dark:border-green-800 dark:text-green-400 rounded-lg"
                        >
                          {t.spaces.classrooms.available()}
                        </Badge>
                      ) : item.classroom.status !== "active" ? (
                        <Badge
                          variant="secondary"
                          className="bg-muted text-muted-foreground rounded-lg"
                        >
                          {item.classroom.status === "maintenance"
                            ? t.spaces.classrooms.maintenance()
                            : t.spaces.classrooms.inactive()}
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                          {t.spaces.classrooms.occupied()}
                        </Badge>
                      )}
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
