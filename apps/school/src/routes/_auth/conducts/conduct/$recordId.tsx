import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Clock, History, MapPin, Sparkles, User } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import { ConductSeverityBadge } from '@/components/conduct/conduct-severity-badge'
import { ConductStatusBadge } from '@/components/conduct/conduct-status-badge'
import { ConductTypeBadge } from '@/components/conduct/conduct-type-badge'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from '@/i18n'
import { conductRecordOptions } from '@/lib/queries/conduct-records'
import { changeStatus } from '@/school/functions/conduct-records'

export const Route = createFileRoute('/_auth/conducts/conduct/$recordId')({
  component: ConductRecordDetailPage,
})

function ConductRecordDetailPage() {
  const t = useTranslations()
  const { recordId } = Route.useParams()
  const queryClient = useQueryClient()

  const { data: record, isLoading } = useQuery(conductRecordOptions(recordId))

  const statusMutation = useMutation({
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

  if (isLoading) {
    return <ConductRecordDetailSkeleton />
  }

  if (!record) {
    return (
      <div className="space-y-6 p-1">
        <Breadcrumbs items={[]} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-dashed border-border/60 bg-card/20 backdrop-blur-sm p-20 flex flex-col items-center text-center"
        >
          <p className="text-xl font-bold text-muted-foreground">{t.conduct.notFound()}</p>
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
          <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.common.back()}
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hidden md:block">
            {t.common.status()}
            :
          </span>
          <Select value={record.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40">
              <SelectItem value="open" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-2">{t.conduct.status.open()}</SelectItem>
              <SelectItem value="investigating" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-2">{t.conduct.status.investigating()}</SelectItem>
              <SelectItem value="pending_decision" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-2">{t.conduct.status.pending_decision()}</SelectItem>
              <SelectItem value="resolved" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-2">{t.conduct.status.resolved()}</SelectItem>
              <SelectItem value="closed" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-2">{t.conduct.status.closed()}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Sparkles className="size-32" />
              </div>
              <CardHeader className="relative pb-0">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <ConductTypeBadge type={record.type as any} />
                    {record.severity && (
                      <ConductSeverityBadge severity={record.severity as any} />
                    )}
                    <ConductStatusBadge status={record.status as any} />
                  </div>
                  <CardTitle className="text-4xl font-black tracking-tight uppercase leading-tight">{record.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
                <div className="p-6 rounded-2xl bg-muted/20 border border-border/10 italic text-lg leading-relaxed text-muted-foreground/80 relative">
                  <span className="absolute -top-4 -left-2 text-6xl text-primary/10 font-serif">"</span>
                  {record.description}
                  <span className="absolute -bottom-10 -right-2 text-6xl text-primary/10 font-serif rotate-180">"</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                  {record.incidentDate && (
                    <div className="flex items-center gap-4 group">
                      <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                        <Calendar className="size-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{t.conduct.form.incidentDate()}</div>
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
                    <div className="flex items-center gap-4 group">
                      <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                        <MapPin className="size-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{t.conduct.form.location()}</div>
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
                      className="pt-6 border-t border-border/10"
                    >
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-4 ml-1">
                        <User className="inline-block size-3 mr-1" />
                        {t.conduct.form.witnesses()}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {record.witnesses.map((witness: string) => (
                          <span key={witness} className="px-3 py-1.5 rounded-xl bg-card border border-border/40 text-xs font-bold uppercase tracking-widest hover:bg-muted/50 transition-colors">
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
                <div className="flex items-center gap-2 ml-1">
                  <div className="h-px flex-1 bg-border/20" />
                  <History className="size-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">{t.conduct.resolution()}</span>
                  <div className="h-px flex-1 bg-border/20" />
                </div>
                <Card className="rounded-3xl border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl">
                  <CardContent className="p-8">
                    <p className="font-medium text-emerald-950/70 dark:text-emerald-50/70 tracking-tight leading-relaxed">{record.resolutionNotes}</p>
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
            <Card className="overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl group">
              <CardHeader className="bg-muted/20 border-b border-border/20">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.conduct.student()}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-4 border-primary/10 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <AvatarImage src={record.studentPhoto ?? undefined} />
                    <AvatarFallback className="bg-primary/5 text-primary text-lg font-black">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-black tracking-tight text-xl leading-none mb-1 group-hover:text-primary transition-colors">{record.studentName ?? 'Unknown'}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{record.studentMatricule}</div>
                  </div>
                </div>
                <div className="mt-6">
                  <Link to="/students/$studentId" params={{ studentId: record.studentId }}>
                    <Button variant="outline" className="w-full rounded-2xl border-border/40 font-black uppercase tracking-widest text-[10px] h-12 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
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
            <Card className="rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl">
              <CardHeader className="bg-muted/20 border-b border-border/20">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.conduct.recordedBy()}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/5">
                    <User className="size-4 text-primary" />
                  </div>
                  <span className="font-bold tracking-tight">{record.recordedByName ?? 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/5">
                    <Clock className="size-4 text-primary" />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
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
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
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
