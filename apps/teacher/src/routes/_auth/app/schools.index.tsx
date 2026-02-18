import { formatPhone } from '@repo/data-ops'
import { IconBuilding, IconChevronRight, IconMapPin, IconPhone } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { m as motion } from 'motion/react'
import { memo } from 'react'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { getTeacherSchoolsQuery } from '@/teacher/functions/schools'

export const Route = createFileRoute('/_auth/app/schools/')({
  component: SchoolsPage,
})

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
}

const SchoolCard = memo(({ school }: SchoolCardProps) => {
  const { LL } = useI18nContext()
  const initials = school.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()

  const cityFromAddress = school.address?.split(',').pop()?.trim() || school.address

  return (
    <Link
      to="/app/schools/$schoolId/classes"
      params={{ schoolId: school.id }}
      className="block group w-full"
    >
      <Card className="pt-0 flex flex-col md:flex-row min-h-[160px] overflow-hidden border-border/40 bg-card/30 backdrop-blur-xl transition-all hover:border-primary/40 hover:bg-card/50 hover:shadow-2xl active:scale-[0.99] border relative w-full">
        <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 overflow-hidden bg-muted/20">
          <Avatar className="h-full w-full rounded-none">
            <AvatarImage
              src={school.logoUrl ?? undefined}
              alt={school.name}
              className="object-cover h-full w-full transition-transform duration-1000 group-hover:scale-110"
            />
            <AvatarFallback className="rounded-none bg-primary/5 text-4xl font-black text-primary/20 uppercase tracking-tighter">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="absolute inset-0 bg-linear-to-t from-card/90 via-transparent to-transparent md:bg-linear-to-r md:from-transparent md:to-card/90" />
        </div>

        <CardContent className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-center min-w-0 overflow-hidden relative z-10">
          <div className="space-y-4 md:space-y-5">
            <div className="space-y-1.5 md:space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {school.name}
              </h2>
              <div className="flex items-center gap-2.5 flex-wrap">
                {school.code && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase tracking-[0.2em] text-[10px] font-black py-0.5 px-2.5 h-6">
                    {school.code}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-black opacity-60">
                  {LL.common.teacher()}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 sm:gap-6 md:gap-3 lg:gap-8 items-start sm:items-center md:items-start lg:items-center">
              {cityFromAddress && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground/90 font-bold tracking-wide min-w-0 overflow-hidden shrink-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-muted/40 text-primary/60 border border-border/20 shrink-0">
                    <IconMapPin className="h-4 w-4" />
                  </div>
                  <span className="truncate flex-1">{cityFromAddress}</span>
                </div>
              )}
              {school.phone && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground/90 font-bold tracking-wide min-w-0 overflow-hidden shrink-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-muted/40 text-primary/60 border border-border/20 shrink-0">
                    <IconPhone className="h-4 w-4" />
                  </div>
                  <span className="truncate flex-1">{formatPhone(school.phone)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 border border-primary/10 transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 shadow-2xl">
            <IconChevronRight className="h-7 w-7 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  )
})

SchoolCard.displayName = 'SchoolCard'

function SchoolsPage() {
  const { LL } = useI18nContext()
  const { context, isLoading: contextLoading } = useRequiredTeacherContext()
  const { data: schools, isPending: schoolsPending } = useQuery({
    queryKey: ['teacher', 'schools', context?.userId],
    queryFn: () => getTeacherSchoolsQuery({ data: { userId: context?.userId ?? '' } }),
    enabled: !!context?.userId,
  })

  const isPending = contextLoading || schoolsPending

  if (isPending) {
    return <SchoolsPageSkeleton />
  }

  if (!schools || schools.length === 0) {
    return <EmptySchoolsState />
  }

  return (
    <div className="min-h-screen bg-background/50 flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-4xl px-4 py-10 sm:py-16 flex flex-col gap-10 overflow-hidden">
        <header className="space-y-3 px-2 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
              {LL.schools.title()}
            </h1>
            <p className="mt-3 text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              {schools.length === 1
                ? LL.schools.attachedSchool()
                : LL.schools.attachedSchools({ count: schools.length })}
            </p>
          </motion.div>
        </header>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 w-full"
        >
          {schools.map((school: SchoolCardProps['school']) => (
            <motion.div key={school.id} variants={item} className="w-full">
              <SchoolCard school={school} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

interface SchoolCardProps {
  school: {
    id: string
    name: string
    code: string | null
    address: string | null
    phone: string | null
    email: string | null
    logoUrl: string | null
  }
}

function EmptySchoolsState() {
  const { LL } = useI18nContext()
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center gap-8 p-4 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-[100px]" />
        <div className="relative rounded-[2.5rem] bg-card/50 border border-border/50 p-10 shadow-2xl backdrop-blur-2xl">
          <IconBuilding className="h-20 w-20 text-primary" />
        </div>
      </motion.div>
      <div className="space-y-3 max-w-sm text-center">
        <h2 className="text-3xl font-black tracking-tight">{LL.schools.emptyTitle()}</h2>
        <p className="text-muted-foreground leading-relaxed font-medium">
          {LL.schools.emptyDescription()}
        </p>
      </div>
    </div>
  )
}

function SchoolsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background/50 flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 py-10 sm:py-16 flex flex-col gap-10">
        <div className="space-y-4 px-2">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-5 w-40 rounded-lg" />
        </div>
        <div className="space-y-6">
          {[1, 2].map(i => (
            <Card key={i} className="overflow-hidden border-border/40 bg-card/30 flex flex-col md:flex-row h-auto md:h-[160px]">
              <Skeleton className="h-48 md:h-full w-full md:w-64 shrink-0 rounded-none" />
              <div className="flex-1 p-8 space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-3/4 rounded-lg" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-32 rounded-md" />
                  </div>
                </div>
                <div className="flex gap-8">
                  <Skeleton className="h-7 w-32 rounded-lg" />
                  <Skeleton className="h-7 w-40 rounded-lg" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
