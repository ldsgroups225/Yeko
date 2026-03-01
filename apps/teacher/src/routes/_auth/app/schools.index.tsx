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
      className="group block w-full"
    >
      <Card className="
        border-border/40 bg-card/30
        hover:border-primary/40 hover:bg-card/50
        relative flex min-h-[160px] w-full flex-col overflow-hidden border pt-0
        backdrop-blur-xl transition-all
        hover:shadow-2xl
        active:scale-[0.99]
        md:flex-row
      "
      >
        <div className="
          bg-muted/20 relative h-48 w-full shrink-0 overflow-hidden
          md:h-auto md:w-64
        "
        >
          <Avatar className="h-full w-full rounded-none">
            <AvatarImage
              src={school.logoUrl ?? undefined}
              alt={school.name}
              className="
                h-full w-full object-cover transition-transform duration-1000
                group-hover:scale-110
              "
            />
            <AvatarFallback className="
              bg-primary/5 text-primary/20 rounded-none text-4xl font-black
              tracking-tighter uppercase
            "
            >
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="
            from-card/90
            md:to-card/90
            absolute inset-0 bg-linear-to-t via-transparent to-transparent
            md:bg-linear-to-r md:from-transparent
          "
          />
        </div>

        <CardContent className="
          relative z-10 flex min-w-0 flex-1 flex-col justify-center
          overflow-hidden p-4
          sm:p-6
          md:p-8
        "
        >
          <div className="
            space-y-4
            md:space-y-5
          "
          >
            <div className="
              space-y-1.5
              md:space-y-2
            "
            >
              <h2 className="
                text-foreground
                group-hover:text-primary
                line-clamp-2 text-xl leading-tight font-black tracking-tight
                transition-colors
                sm:text-2xl
                md:text-3xl
              "
              >
                {school.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2.5">
                {school.code && (
                  <Badge
                    variant="secondary"
                    className="
                      bg-primary/10 text-primary border-primary/20
                      hover:bg-primary/20
                      h-6 px-2.5 py-0.5 text-[10px] font-black tracking-[0.2em]
                      uppercase transition-colors
                    "
                  >
                    {school.code}
                  </Badge>
                )}
                <span className="
                  text-muted-foreground text-[10px] font-black tracking-[0.15em]
                  uppercase opacity-60
                "
                >
                  {LL.common.teacher()}
                </span>
              </div>
            </div>

            <div className="
              flex flex-col items-start gap-3
              sm:flex-row sm:items-center sm:gap-6
              md:flex-col md:items-start md:gap-3
              lg:flex-row lg:items-center lg:gap-8
            "
            >
              {cityFromAddress && (
                <div className="
                  text-muted-foreground/90 flex min-w-0 shrink-0 items-center
                  gap-3 overflow-hidden text-xs font-bold tracking-wide
                "
                >
                  <div className="
                    bg-muted/40 text-primary/60 border-border/20 flex h-7 w-7
                    shrink-0 items-center justify-center rounded-xl border
                  "
                  >
                    <IconMapPin className="h-4 w-4" />
                  </div>
                  <span className="flex-1 truncate">{cityFromAddress}</span>
                </div>
              )}
              {school.phone && (
                <div className="
                  text-muted-foreground/90 flex min-w-0 shrink-0 items-center
                  gap-3 overflow-hidden text-xs font-bold tracking-wide
                "
                >
                  <div className="
                    bg-muted/40 text-primary/60 border-border/20 flex h-7 w-7
                    shrink-0 items-center justify-center rounded-xl border
                  "
                  >
                    <IconPhone className="h-4 w-4" />
                  </div>
                  <span className="flex-1 truncate">{formatPhone(school.phone)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <div className="
          absolute top-1/2 right-8 hidden -translate-y-1/2
          md:flex
        "
        >
          <div className="
            bg-primary/5 border-primary/10
            group-hover:bg-primary group-hover:text-primary-foreground
            flex h-14 w-14 items-center justify-center rounded-full border
            shadow-2xl transition-all
            group-hover:scale-110
          "
          >
            <IconChevronRight className="
              h-7 w-7 transition-transform
              group-hover:translate-x-1
            "
            />
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
    <div className="
      bg-background/50 flex min-h-screen flex-col items-center overflow-x-hidden
    "
    >
      <div className="
        flex w-full max-w-4xl flex-col gap-10 overflow-hidden px-4 py-10
        sm:py-16
      "
      >
        <header className="
          space-y-3 px-2 text-center
          sm:text-left
        "
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="
              text-foreground text-4xl font-black tracking-tight
              sm:text-5xl
            "
            >
              {LL.schools.title()}
            </h1>
            <p className="
              text-muted-foreground mt-3 flex items-center justify-center
              gap-2.5 font-medium
              sm:justify-start
            "
            >
              <span className="
                bg-primary flex h-2.5 w-2.5 animate-pulse rounded-full
              "
              />
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
          className="grid w-full gap-6"
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
    <div className="
      flex min-h-[75vh] flex-col items-center justify-center gap-8 p-4
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
          bg-card/50 border-border/50 relative rounded-[2.5rem] border p-10
          shadow-2xl backdrop-blur-2xl
        "
        >
          <IconBuilding className="text-primary h-20 w-20" />
        </div>
      </motion.div>
      <div className="max-w-sm space-y-3 text-center">
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
    <div className="bg-background/50 flex min-h-screen flex-col items-center">
      <div className="
        flex w-full max-w-4xl flex-col gap-10 px-4 py-10
        sm:py-16
      "
      >
        <div className="space-y-4 px-2">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-5 w-40 rounded-lg" />
        </div>
        <div className="space-y-6">
          {[1, 2].map(i => (
            <Card
              key={i}
              className="
                border-border/40 bg-card/30 flex h-auto flex-col overflow-hidden
                md:h-[160px] md:flex-row
              "
            >
              <Skeleton className="
                h-48 w-full shrink-0 rounded-none
                md:h-full md:w-64
              "
              />
              <div className="flex-1 space-y-6 p-8">
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
