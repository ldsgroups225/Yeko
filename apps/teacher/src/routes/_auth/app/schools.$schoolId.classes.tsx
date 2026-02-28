import {
  IconBook,
  IconChartBar,
  IconChevronRight,
  IconGridDots,
  IconLayoutList,
  IconMars,
  IconSchool,
  IconStar,
  IconUsers,
  IconVenus,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { cn } from '@workspace/ui/lib/utils'
import { AnimatePresence, m as motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { teacherClassesQueryOptions } from '@/lib/queries/classes'
import { getTeacherSchoolsQuery } from '@/teacher/functions/schools'

export const Route = createFileRoute('/_auth/app/schools/$schoolId/classes')({
  component: SchoolClassesPage,
})

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function SchoolClassesPage() {
  const { LL } = useI18nContext()
  const { schoolId } = Route.useParams()
  const { context, isLoading: contextLoading } = useRequiredTeacherContext()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data, isPending: classesPending } = useQuery({
    ...teacherClassesQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
      schoolId,
    }),
    enabled: !!context?.teacherId && !!context?.schoolYearId && !!schoolId,
  })

  const { data: schools } = useQuery({
    queryKey: ['teacher', 'schools', context?.userId],
    queryFn: () => getTeacherSchoolsQuery({ data: { userId: context?.userId ?? '' } }),
    enabled: !!context?.userId,
  })

  const isPending = contextLoading || classesPending
  const classes = data?.classes || []

  // Find current school from the schools list
  const currentSchool = schools?.find(s => s.id === schoolId)
  const schoolName = currentSchool?.name || (classes[0] as { schoolName?: string })?.schoolName || LL.classes.defaultSchool()
  const schoolLogo = currentSchool?.logoUrl

  if (isPending) {
    return <ClassesPageSkeleton />
  }

  if (classes.length === 0) {
    return <EmptyClassesState schoolName={schoolName} />
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 pb-24">
      <header className="
        flex flex-col justify-between gap-6 px-1
        sm:flex-row sm:items-end
      "
      >
        <div className="
          space-y-2 text-center
          sm:text-left
        "
        >
          <div className="
            mb-2 flex flex-col items-center gap-4
            sm:flex-row sm:gap-6
          "
          >
            <Avatar className="
              border-border/50 h-16 w-16 rounded-2xl border-2 shadow-2xl
              sm:h-20 sm:w-20
            "
            >
              <AvatarImage
                src={schoolLogo ?? undefined}
                alt={schoolName}
                className="object-cover"
              />
              <AvatarFallback className="
                from-primary/20 to-primary/5 text-primary rounded-2xl
                bg-linear-to-br
              "
              >
                <IconSchool className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="
              space-y-2 text-center
              sm:text-left
            "
            >
              <h1 className="
                text-foreground text-3xl leading-tight font-black
                tracking-tighter
                sm:text-4xl
              "
              >
                {schoolName}
              </h1>
              <div className="
                flex items-center justify-center gap-3
                sm:justify-start
              "
              >
                <div className="
                  bg-primary/10 text-primary flex items-center gap-1.5
                  rounded-full px-2.5 py-1 text-xs font-bold tracking-wide
                  uppercase
                "
                >
                  <IconBook className="h-3.5 w-3.5" />
                  {LL.classes.title()}
                </div>
                <span className="
                  text-muted-foreground/60 text-xs font-bold tracking-widest
                  uppercase
                "
                >
                  {LL.profile.schoolYear()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Tabs
            value={viewMode}
            onValueChange={v => setViewMode(v as 'grid' | 'list')}
            className="w-fit"
          >
            <TabsList className="bg-muted/50 grid w-full grid-cols-2 p-1">
              <TabsTrigger value="grid" className="gap-2 px-4">
                <IconGridDots className="h-4 w-4" />
                <span className="
                  hidden
                  sm:inline
                "
                >
                  {LL.classes.grid()}
                </span>
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2 px-4">
                <IconLayoutList className="h-4 w-4" />
                <span className="
                  hidden
                  sm:inline
                "
                >
                  {LL.classes.list()}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          variants={container}
          initial="hidden"
          animate="show"
          className={cn(
            'w-full',
            viewMode === 'grid'
              ? `
                grid gap-6
                md:grid-cols-2
                lg:grid-cols-3
              `
              : 'flex flex-col gap-4',
          )}
        >
          {classes.map((cls: ClassCardProps['classData'] & { id: string }) => (
            <motion.div key={cls.id} variants={item}>
              <ClassCard classData={cls} viewMode={viewMode} schoolId={schoolId} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface ClassCardProps {
  classData: {
    id: string
    name: string
    gradeName: string | null
    studentCount: number
    boysCount: number
    girlsCount: number
    isHomeroomTeacher: boolean
    classAverage: number | null
    subjectCount: number
  }
  viewMode: 'grid' | 'list'
  schoolId: string
}

function ClassCard({ classData, viewMode, schoolId }: ClassCardProps) {
  const { LL } = useI18nContext()
  const averageColor = useMemo(() => {
    if (!classData.classAverage)
      return 'text-muted-foreground'
    if (classData.classAverage >= 12)
      return 'text-green-500'
    if (classData.classAverage >= 10)
      return 'text-orange-500'
    return 'text-red-500'
  }, [classData.classAverage])

  const content = (
    <Card className={cn(
      `
        group border-border/40 bg-card/40
        hover:border-primary/40 hover:bg-card/60
        relative cursor-pointer overflow-hidden border backdrop-blur-xl
        transition-all
        hover:shadow-2xl
        active:scale-[0.99]
      `,
      viewMode === 'list' && 'flex min-h-20 items-center',
    )}
    >
      <div className="
        bg-primary/5 absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-0
        blur-3xl transition-opacity
        group-hover:opacity-100
      "
      />

      <CardContent className={cn('relative z-10 w-full p-4', viewMode === 'list' && `
        flex items-center justify-between gap-4 px-4 py-3
      `)}
      >
        {/* Header Section */}
        <div className={cn('flex-1 space-y-3', viewMode === 'list' && `
          flex items-center gap-6 space-y-0
        `)}
        >
          <div className="min-w-[120px] space-y-1">
            <h3 className="
              text-foreground
              group-hover:text-primary
              text-xl font-black tracking-tight transition-colors
              sm:text-2xl
            "
            >
              {classData.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="
                  bg-muted/30 h-5 px-1.5 text-[10px] font-black tracking-widest
                  uppercase
                "
              >
                {classData.gradeName}
              </Badge>
              {classData.isHomeroomTeacher && (
                <Badge className="
                  bg-primary/20 text-primary h-5 border-none px-1.5 text-[9px]
                  font-black tracking-tighter uppercase
                "
                >
                  <IconStar className="mr-1 h-2.5 w-2.5 fill-current" />
                  {LL.classes.homeroom()}
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className={cn(
            'w-full',
            viewMode === 'grid'
              ? 'grid grid-cols-2 gap-3 pt-2'
              : `flex flex-wrap items-center gap-8`,
          )}
          >
            {/* Students & Gender - Full width in grid */}
            <div className={cn('flex items-center gap-3', viewMode === 'grid' && `
              bg-muted/20 border-border/40 col-span-2 rounded-lg border p-2
            `)}
            >
              {viewMode === 'grid' && (
                <div className="
                  bg-primary/10 text-primary flex h-8 w-8 items-center
                  justify-center rounded-lg
                "
                >
                  <IconUsers className="h-4 w-4" />
                </div>
              )}
              <div className="
                flex w-full flex-row items-center justify-between gap-2
              "
              >
                <div className="flex flex-col">
                  <span className="text-sm leading-none font-black">{classData.studentCount}</span>
                  <span className="
                    text-muted-foreground text-[9px] font-bold uppercase
                  "
                  >
                    {LL.classes.students()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="
                    flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5
                    py-1 text-[10px] font-bold text-blue-600
                    dark:text-blue-400
                  "
                  >
                    <IconMars className="h-3 w-3" />
                    {classData.boysCount}
                  </div>
                  <div className="
                    flex items-center gap-1 rounded-md bg-pink-500/10 px-1.5
                    py-1 text-[10px] font-bold text-pink-600
                    dark:text-pink-400
                  "
                  >
                    <IconVenus className="h-3 w-3" />
                    {classData.girlsCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Average */}
            <div className={cn('flex items-center gap-2.5', viewMode === 'grid' && `
              bg-muted/10 border-border/40 rounded-lg border p-2
            `)}
            >
              {viewMode === 'grid' && (
                <div className="
                  bg-muted text-muted-foreground flex h-7 w-7 items-center
                  justify-center rounded-md
                "
                >
                  <IconChartBar className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="flex flex-col">
                <span className={cn('text-sm leading-none font-black', averageColor)}>
                  {classData.classAverage ? classData.classAverage.toFixed(2) : LL.common.notAvailable()}
                </span>
                <span className="
                  text-muted-foreground mt-0.5 text-[8px] font-bold uppercase
                "
                >
                  {LL.classes.average()}
                </span>
              </div>
            </div>

            {/* Subjects */}
            <div className={cn('flex items-center gap-2.5', viewMode === 'grid' && `
              bg-muted/10 border-border/40 rounded-lg border p-2
            `, viewMode === 'list' && `
              hidden
              lg:flex
            `)}
            >
              {viewMode === 'grid' && (
                <div className="
                  bg-muted text-muted-foreground flex h-7 w-7 items-center
                  justify-center rounded-md
                "
                >
                  <IconBook className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm leading-none font-black">{classData.subjectCount}</span>
                <span className="
                  text-muted-foreground mt-0.5 text-[8px] font-bold uppercase
                "
                >
                  {LL.classes.subjects()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="
            bg-muted/30 text-muted-foreground
            group-hover:bg-primary/10 group-hover:text-primary
            hidden h-9 w-9 shrink-0 items-center justify-center rounded-full
            transition-all
            group-hover:scale-110
            sm:flex
          "
          >
            <IconChevronRight className="h-5 w-5" />
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="
            absolute right-4 bottom-4 translate-x-2 opacity-0 transition-all
            group-hover:translate-x-0 group-hover:opacity-100
          "
          >
            <IconChevronRight className="text-primary h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Link
      to="/app/schools/$schoolId/class/$classId"
      params={{ schoolId, classId: classData.id }}
      search={{ timetableSessionId: undefined }}
    >
      <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        {content}
      </motion.div>
    </Link>
  )
}
function EmptyClassesState({ schoolName }: { schoolName: string }) {
  const { LL } = useI18nContext()
  return (
    <div className="
      flex min-h-[70vh] flex-col items-center justify-center gap-8 p-4
      text-center
    "
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative"
      >
        <div className="
          bg-primary/20 absolute inset-0 rounded-full blur-[100px]
        "
        />
        <div className="
          bg-card/50 border-border/50 relative rounded-[2.5rem] border p-12
          shadow-2xl backdrop-blur-2xl
        "
        >
          <IconBook className="text-primary h-20 w-20 opacity-40" />
        </div>
      </motion.div>
      <div className="max-w-sm space-y-4 px-6">
        <div className="space-y-2">
          <Badge
            variant="outline"
            className="
              bg-primary/5 text-primary border-primary/20 px-3 text-[10px]
              font-black tracking-widest uppercase
            "
          >
            {schoolName}
          </Badge>
          <h2 className="text-3xl font-black tracking-tight">{LL.classes.noClasses()}</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed font-medium">
          {LL.classes.emptyDescription()}
        </p>
      </div>
    </div>
  )
}

function ClassesPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 pb-24">
      <div className="
        flex flex-col justify-between gap-6 px-1
        sm:flex-row sm:items-end
      "
      >
        <div className="
          space-y-4 text-center
          sm:text-left
        "
        >
          <Skeleton className="
            mx-auto h-3 w-32 rounded-full
            sm:mx-0
          "
          />
          <Skeleton className="
            mx-auto h-12 w-64 rounded-xl
            sm:mx-0
          "
          />
          <Skeleton className="
            mx-auto h-4 w-80 rounded-lg
            sm:mx-0
          "
          />
        </div>
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>

      <div className="
        grid gap-6
        md:grid-cols-2
        lg:grid-cols-3
      "
      >
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="border-border/40 bg-card/30 overflow-hidden">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
