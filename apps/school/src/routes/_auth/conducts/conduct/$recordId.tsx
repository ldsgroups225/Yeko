import { IconArrowLeft, IconCalendar, IconClock, IconHistory, IconMapPin, IconUser } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import { ConductSeverityBadge } from '@/components/conduct/conduct-severity-badge'
import { ConductStatusBadge } from '@/components/conduct/conduct-status-badge'
import { ConductTypeBadge } from '@/components/conduct/conduct-type-badge'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { conductRecordOptions } from '@/lib/queries/conduct-records'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { changeStatus } from '@/school/functions/conduct-records'

export const Route = createFileRoute('/_auth/conducts/conduct/$recordId')({
  component: ConductRecordDetailPage,
})

function ConductRecordDetailPage() {
  const t = useTranslations()
  const { recordId } = Route.useParams()
  const queryClient = useQueryClient()

  const { data: result, isPending } = useQuery(conductRecordOptions(recordId))

  const record = result || null

  const statusMutation = useMutation({
    mutationKey: schoolMutationKeys.conductRecords.update,
    mutationFn: changeStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conduct-records'] })
      toast.success(t.conduct.statusUpdated(), {
        className: 'rounded-2xl backdrop-blur-xl bg-background/80 border-border/40 font-bold',
      })
    },
  })

  const handleStatusChange = (status: string) => {
    statusMutation.mutate({
      data: {
        id: recordId,
        status: status as 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed',
      },
    })
  }

  if (isPending) {
    return <ConductRecordDetailSkeleton />
  }

  if (!record) {
    return (
      <div className="space-y-6 p-1">
        <Breadcrumbs items={[]} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="
            border-border/60 bg-card/20 flex flex-col items-center rounded-3xl
            border border-dashed p-20 text-center backdrop-blur-sm
          "
        >
          <p className="text-muted-foreground text-xl font-bold">{t.conduct.notFound()}</p>
        </motion.div>
      </div>
    )
  }

  const initials = (record.studentName ?? 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.schoolLife(), href: '/conducts' },
          { label: t.schoolLife.conduct(), href: '/conducts/conduct' },
          { label: record.title },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <Link to="/conducts/conduct">
          <Button
            variant="ghost"
            size="sm"
            className="
              hover:bg-primary/10 hover:text-primary
              rounded-xl text-[10px] font-black tracking-widest uppercase
              transition-all
            "
          >
            <IconArrowLeft className="mr-2 h-4 w-4" />
            {t.common.back()}
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="
            text-muted-foreground/40 hidden text-[10px] font-black
            tracking-widest uppercase
            md:block
          "
          >
            {t.common.status()}
            :
          </span>
          <Select value={record.status} onValueChange={v => handleStatusChange(v ?? 'open')}>
            <SelectTrigger className="
              bg-card/50 border-border/40
              focus:ring-primary/20
              h-10 w-[180px] rounded-xl font-bold backdrop-blur-xl
              transition-all
            "
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="
              bg-popover/90 border-border/40 rounded-2xl backdrop-blur-2xl
            "
            >
              <SelectItem
                value="open"
                className="
                  rounded-xl py-2 text-[10px] font-bold tracking-widest
                  uppercase
                "
              >
                {t.conduct.status.open()}
              </SelectItem>
              <SelectItem
                value="investigating"
                className="
                  rounded-xl py-2 text-[10px] font-bold tracking-widest
                  uppercase
                "
              >
                {t.conduct.status.investigating()}
              </SelectItem>
              <SelectItem
                value="pending_decision"
                className="
                  rounded-xl py-2 text-[10px] font-bold tracking-widest
                  uppercase
                "
              >
                {t.conduct.status.pending_decision()}
              </SelectItem>
              <SelectItem
                value="resolved"
                className="
                  rounded-xl py-2 text-[10px] font-bold tracking-widest
                  uppercase
                "
              >
                {t.conduct.status.resolved()}
              </SelectItem>
              <SelectItem
                value="closed"
                className="
                  rounded-xl py-2 text-[10px] font-bold tracking-widest
                  uppercase
                "
              >
                {t.conduct.status.closed()}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="
        grid gap-8
        md:grid-cols-3
      "
      >
        <div className="
          space-y-8
          md:col-span-2
        "
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="
              border-border/40 bg-card/30 relative overflow-hidden rounded-3xl
              shadow-2xl backdrop-blur-xl
            "
            >

              <CardHeader className="relative pb-0">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <ConductTypeBadge type={record.type as 'incident' | 'sanction' | 'reward' | 'note'} />
                    {record.severity && (
                      <ConductSeverityBadge severity={record.severity as 'low' | 'medium' | 'high' | 'critical' | 'urgent'} />
                    )}
                    <ConductStatusBadge status={record.status as 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed'} />
                  </div>
                  <CardTitle className="
                    text-4xl leading-tight font-black tracking-tight uppercase
                  "
                  >
                    {record.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
                <div className="
                  bg-muted/20 border-border/10 text-muted-foreground/80 relative
                  rounded-2xl border p-6 text-lg leading-relaxed italic
                "
                >
                  <span className="
                    text-primary/10 absolute -top-4 -left-2 font-serif text-6xl
                  "
                  >
                    "
                  </span>
                  {record.description}
                  <span className="
                    text-primary/10 absolute -right-2 -bottom-10 rotate-180
                    font-serif text-6xl
                  "
                  >
                    "
                  </span>
                </div>

                <div className="
                  grid gap-6 pt-4
                  sm:grid-cols-2
                "
                >
                  {record.incidentDate && (
                    <div className="group flex items-center gap-4">
                      <div className="
                        bg-primary/5 border-primary/10
                        group-hover:bg-primary/10
                        rounded-2xl border p-3 transition-colors
                      "
                      >
                        <IconCalendar className="text-primary size-5" />
                      </div>
                      <div>
                        <div className="
                          text-muted-foreground/40 text-[10px] font-black
                          tracking-widest uppercase
                        "
                        >
                          {t.conduct.form.incidentDate()}
                        </div>
                        <div className="font-bold">
                          {new Date(record.incidentDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                          {record.incidentTime && (
                            <span className="text-muted-foreground ml-2">
                              @
                              {record.incidentTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {record.location && (
                    <div className="group flex items-center gap-4">
                      <div className="
                        bg-primary/5 border-primary/10
                        group-hover:bg-primary/10
                        rounded-2xl border p-3 transition-colors
                      "
                      >
                        <IconMapPin className="text-primary size-5" />
                      </div>
                      <div>
                        <div className="
                          text-muted-foreground/40 text-[10px] font-black
                          tracking-widest uppercase
                        "
                        >
                          {t.conduct.form.location()}
                        </div>
                        <div className="font-bold">{record.location}</div>
                      </div>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {record.witnesses && record.witnesses.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-border/10 border-t pt-6"
                    >
                      <h4 className="
                        text-muted-foreground/40 mb-4 ml-1 text-[10px]
                        font-black tracking-widest uppercase
                      "
                      >
                        <IconUser className="mr-1 inline-block size-3" />
                        {t.conduct.form.witnesses()}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {record.witnesses.map((witness: string) => (
                          <span
                            key={witness}
                            className="
                              bg-card border-border/40
                              hover:bg-muted/50
                              rounded-xl border px-3 py-1.5 text-xs font-bold
                              tracking-widest uppercase transition-colors
                            "
                          >
                            {witness}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          <AnimatePresence>
            {record.resolutionNotes && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="ml-1 flex items-center gap-2">
                  <div className="bg-border/20 h-px flex-1" />
                  <IconHistory className="text-success size-4" />
                  <span className="
                    text-success/60 text-[10px] font-black tracking-widest
                    uppercase
                  "
                  >
                    {t.conduct.resolution()}
                  </span>
                  <div className="bg-border/20 h-px flex-1" />
                </div>
                <Card className="
                  border-success/20 bg-success/5 rounded-3xl backdrop-blur-xl
                "
                >
                  <CardContent className="p-8">
                    <p className="
                      text-success leading-relaxed font-medium tracking-tight
                    "
                    >
                      {record.resolutionNotes}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="
              border-border/40 bg-card/30 group overflow-hidden rounded-3xl
              shadow-xl backdrop-blur-xl
            "
            >
              <CardHeader className="bg-muted/20 border-border/20 border-b">
                <CardTitle className="
                  text-muted-foreground/60 text-[10px] font-black
                  tracking-widest uppercase
                "
                >
                  {t.conduct.student()}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="
                    border-primary/10 h-16 w-16 border-4 shadow-xl
                    transition-transform duration-500
                    group-hover:scale-110
                  "
                  >
                    <AvatarImage src={record.studentPhoto ?? undefined} />
                    <AvatarFallback className="
                      bg-primary/5 text-primary text-lg font-black
                    "
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="
                      group-hover:text-primary
                      mb-1 text-xl leading-none font-black tracking-tight
                      transition-colors
                    "
                    >
                      {record.studentName ?? 'Unknown'}
                    </div>
                    <div className="
                      text-muted-foreground/40 text-[10px] font-black
                      tracking-widest uppercase
                    "
                    >
                      {record.studentMatricule}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Link to="/students/$studentId" params={{ studentId: record.studentId }}>
                    <Button
                      variant="outline"
                      className="
                        border-border/40
                        hover:bg-primary hover:text-primary-foreground
                        hover:border-primary
                        h-12 w-full rounded-2xl text-[10px] font-black
                        tracking-widest uppercase transition-all
                      "
                    >
                      {t.common.view()}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="
              border-border/40 bg-card/30 rounded-3xl shadow-xl backdrop-blur-xl
            "
            >
              <CardHeader className="bg-muted/20 border-border/20 border-b">
                <CardTitle className="
                  text-muted-foreground/60 text-[10px] font-black
                  tracking-widest uppercase
                "
                >
                  {t.conduct.recordedBy()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/5 rounded-xl p-2">
                    <IconUser className="text-primary size-4" />
                  </div>
                  <span className="font-bold tracking-tight">{record.recordedByName ?? 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/5 rounded-xl p-2">
                    <IconClock className="text-primary size-4" />
                  </div>
                  <div className="text-muted-foreground text-xs font-medium">
                    {new Date(record.createdAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ConductRecordDetailSkeleton() {
  return (
    <div className="space-y-8 p-1">
      <Skeleton className="mb-6 h-6 w-48" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="
        grid gap-8
        md:grid-cols-3
      "
      >
        <div className="
          space-y-8
          md:col-span-2
        "
        >
          <Skeleton className="h-[400px] w-full rounded-3xl" />
          <Skeleton className="h-[150px] w-full rounded-3xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-[200px] w-full rounded-3xl" />
          <Skeleton className="h-[150px] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  )
}
