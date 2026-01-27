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
import { AnimatePresence, motion } from 'motion/react'
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

  const { data, isLoading: classesLoading } = useQuery({
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

  const isLoading = contextLoading || classesLoading
  const classes = data?.classes || []

  // Find current school from the schools list
  const currentSchool = schools?.find(s => s.id === schoolId)
  const schoolName = currentSchool?.name || (classes[0] as { schoolName?: string })?.schoolName || LL.classes.defaultSchool()
  const schoolLogo = currentSchool?.logoUrl

  if (isLoading) {
    return <ClassesPageSkeleton />
  }

  if (classes.length === 0) {
    return <EmptyClassesState schoolName={schoolName} />
  }

  return (
    <div className="flex flex-col gap-8 p-4 pb-24 max-w-5xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-2">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-border/50 shadow-2xl rounded-2xl">
              <AvatarImage src={schoolLogo ?? undefined} alt={schoolName} className="object-cover" />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary rounded-2xl">
                <IconSchool className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground leading-tight">
                {schoolName}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                  <IconBook className="w-3.5 h-3.5" />
                  {LL.classes.title()}
                </div>
                <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                  {LL.profile.schoolYear()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'grid' | 'list')} className="w-fit">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
              <TabsTrigger value="grid" className="gap-2 px-4">
                <IconGridDots className="w-4 h-4" />
                <span className="hidden sm:inline">{LL.classes.grid()}</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2 px-4">
                <IconLayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">{LL.classes.list()}</span>
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
              ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
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
      'group relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-xl transition-all hover:border-primary/40 hover:bg-card/60 hover:shadow-2xl active:scale-[0.99] border cursor-pointer',
      viewMode === 'list' && 'flex items-center min-h-20',
    )}
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />

      <CardContent className={cn('p-4 relative z-10 w-full', viewMode === 'list' && 'py-3 px-4 flex items-center justify-between gap-4')}>
        {/* Header Section */}
        <div className={cn('space-y-3 flex-1', viewMode === 'list' && 'space-y-0 flex items-center gap-6')}>
          <div className="space-y-1 min-w-[120px]">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
              {classData.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-muted/30 text-[10px] uppercase tracking-widest font-black h-5 px-1.5">
                {classData.gradeName}
              </Badge>
              {classData.isHomeroomTeacher && (
                <Badge className="bg-primary/20 text-primary border-none text-[9px] uppercase tracking-tighter font-black h-5 px-1.5">
                  <IconStar className="w-2.5 h-2.5 mr-1 fill-current" />
                  {LL.classes.homeroom()}
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className={cn(
            'w-full',
            viewMode === 'grid' ? 'grid grid-cols-2 gap-3 pt-2' : 'flex flex-wrap items-center gap-8',
          )}
          >
            {/* Students & Gender - Full width in grid */}
            <div className={cn('flex items-center gap-3', viewMode === 'grid' && 'col-span-2 bg-muted/20 p-2 rounded-lg border border-border/40')}>
              {viewMode === 'grid' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconUsers className="w-4 h-4" />
                </div>
              )}
              <div className="flex flex-row items-center justify-between w-full gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-black leading-none">{classData.studentCount}</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">{LL.classes.students()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-blue-500/10 px-1.5 py-1 rounded-md text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    <IconMars className="w-3 h-3" />
                    {classData.boysCount}
                  </div>
                  <div className="flex items-center gap-1 bg-pink-500/10 px-1.5 py-1 rounded-md text-[10px] font-bold text-pink-600 dark:text-pink-400">
                    <IconVenus className="w-3 h-3" />
                    {classData.girlsCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Average */}
            <div className={cn('flex items-center gap-2.5', viewMode === 'grid' && 'bg-muted/10 p-2 rounded-lg border border-border/40')}>
              {viewMode === 'grid' && (
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <IconChartBar className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="flex flex-col">
                <span className={cn('text-sm font-black leading-none', averageColor)}>
                  {classData.classAverage ? classData.classAverage.toFixed(2) : '--.--'}
                </span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase mt-0.5">
                  {LL.classes.average()}
                </span>
              </div>
            </div>

            {/* Subjects */}
            <div className={cn('flex items-center gap-2.5', viewMode === 'grid' && 'bg-muted/10 p-2 rounded-lg border border-border/40', viewMode === 'list' && 'hidden lg:flex')}>
              {viewMode === 'grid' && (
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <IconBook className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-black leading-none">{classData.subjectCount}</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase mt-0.5">
                  {LL.classes.subjects()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/30 text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110">
            <IconChevronRight className="w-5 h-5" />
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <IconChevronRight className="w-5 h-5 text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Link to="/app/schools/$schoolId/class/$classId" params={{ schoolId, classId: classData.id }}>
      <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        {content}
      </motion.div>
    </Link>
  )
}
function EmptyClassesState({ schoolName }: { schoolName: string }) {
  const { LL } = useI18nContext()
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 p-4 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-[100px]" />
        <div className="relative rounded-[2.5rem] bg-card/50 border border-border/50 p-12 shadow-2xl backdrop-blur-2xl">
          <IconBook className="h-20 w-20 text-primary opacity-40" />
        </div>
      </motion.div>
      <div className="space-y-4 max-w-sm px-6">
        <div className="space-y-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3">
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
    <div className="flex flex-col gap-8 p-4 pb-24 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div className="space-y-4 text-center sm:text-left">
          <Skeleton className="h-3 w-32 rounded-full mx-auto sm:mx-0" />
          <Skeleton className="h-12 w-64 rounded-xl mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-80 rounded-lg mx-auto sm:mx-0" />
        </div>
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="overflow-hidden border-border/40 bg-card/30">
            <CardContent className="p-6 space-y-6">
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
