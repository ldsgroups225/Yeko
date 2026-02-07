import type { TablerIcon } from '@tabler/icons-react'
import type { TranslationFunctions } from '@/i18n'
import { IconCircleCheck, IconClock, IconDeviceFloppy, IconSearch, IconUserCheck, IconUserMinus, IconUserX } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { ConfirmationDialog } from '@workspace/ui/components/confirmation-dialog'
import { Input } from '@workspace/ui/components/input'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { Textarea } from '@workspace/ui/components/textarea'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

export type TeacherAttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'on_leave'

export interface TeacherAttendanceEntry {
  teacherId: string
  teacherName: string
  teacherPhoto?: string | null
  status: TeacherAttendanceStatus
  arrivalTime?: string
  reason?: string
  notes?: string
}

interface TeacherAttendanceGridProps {
  entries: TeacherAttendanceEntry[]
  onSave: (entries: TeacherAttendanceEntry[]) => void
  isPending?: boolean
  isSaving?: boolean
}

const statusConfig: Record<TeacherAttendanceStatus, {
  label: (t: TranslationFunctions) => string
  icon: TablerIcon
  color: string
  bgColor: string
  borderColor: string
  indicatorColor: string
}> = {
  present: {
    label: t => t.attendance.status.present(),
    icon: IconUserCheck,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    indicatorColor: 'bg-emerald-500',
  },
  late: {
    label: t => t.attendance.status.late(),
    icon: IconClock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    indicatorColor: 'bg-amber-500',
  },
  on_leave: {
    label: t => t.attendance.status.on_leave(),
    icon: IconUserMinus,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50/50 dark:bg-blue-900/20',
    borderColor: 'border-blue-100 dark:border-blue-800',
    indicatorColor: 'bg-blue-500',
  },
  absent: {
    label: t => t.attendance.status.absent(),
    icon: IconUserX,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    indicatorColor: 'bg-rose-500',
  },
  excused: {
    label: t => t.attendance.status.excused(),
    icon: IconUserMinus,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    indicatorColor: 'bg-blue-500',
  },
}

export function TeacherAttendanceGrid({
  entries: initialEntries,
  onSave,
  isPending,
  isSaving,
}: TeacherAttendanceGridProps) {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [entries, setEntries] = useState<TeacherAttendanceEntry[]>(initialEntries)
  const [hasChanges, setHasChanges] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleStatusChange = (teacherId: string, status: TeacherAttendanceStatus) => {
    setEntries(prev => prev.map(e => (e.teacherId === teacherId ? { ...e, status } : e)))
    setHasChanges(true)
  }

  const handleNotesChange = (teacherId: string, notes: string) => {
    setEntries(prev => prev.map(e => (e.teacherId === teacherId ? { ...e, notes } : e)))
    setHasChanges(true)
  }

  const handleMarkAllPresent = () => {
    setEntries(prev => prev.map(e => ({ ...e, status: 'present' as const })))
    setHasChanges(true)
  }

  const handleSave = () => {
    setShowConfirm(true)
  }

  const onConfirmSave = () => {
    onSave(entries)
    setHasChanges(false)
    setShowConfirm(false)
  }

  const filteredEntries = useMemo(() => {
    return entries.filter(e =>
      e.teacherName.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [entries, searchQuery])

  const summary = useMemo(() => ({
    present: entries.filter(e => e.status === 'present').length,
    late: entries.filter(e => e.status === 'late').length,
    absent: entries.filter(e => e.status === 'absent').length,
    excused: entries.filter(e => e.status === 'excused').length,
  }), [entries])

  if (isPending) {
    return <TeacherAttendanceGridSkeleton />
  }

  return (
    <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl">
      <CardHeader className="relative border-b border-border/10 bg-muted/20 pb-4 pt-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {t.nav.teachers()}
              </CardTitle>
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tight">{t.schoolLife.teacherAttendance()}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleMarkAllPresent}
              className="h-9 rounded-2xl border-border/40 font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500/10 hover:text-emerald-500 transition-all px-4"
            >
              <IconCircleCheck className="mr-2 h-4 w-4" />
              {t.attendance.markAllPresent()}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="h-9 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] px-6 transition-all hover:scale-105 active:scale-95 disabled:grayscale"
            >
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isSaving ? t.common.saving() : t.common.save()}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard
            label={t.attendance.status.present()}
            count={summary.present}
            config={statusConfig.present}
          />
          <SummaryCard
            label={t.attendance.status.late()}
            count={summary.late}
            config={statusConfig.late}
          />
          <SummaryCard
            label={t.attendance.status.absent()}
            count={summary.absent}
            config={statusConfig.absent}
          />
          <SummaryCard
            label={t.attendance.status.excused()}
            count={summary.excused}
            config={statusConfig.excused}
          />
        </div>

        <div className="mt-4 relative">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
          <Input
            placeholder={t.common.search()}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-10 pl-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold italic"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="w-[60px] text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center py-4">ID</TableHead>
                <TableHead className="min-w-[200px] text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 py-4">{t.attendance.teacher()}</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center py-4">{t.attendance.status.label()}</TableHead>
                <TableHead className="min-w-[300px] text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 py-4">{t.attendance.notes()}</TableHead>
                <TableHead className="min-w-[240px] text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-right py-4">{t.common.actions()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredEntries.map((entry, index) => (
                  <motion.tr
                    key={entry.teacherId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-border/5 hover:bg-primary/5 transition-colors group"
                  >
                    <TableCell className="text-center py-2">
                      <span className="text-[10px] font-black text-muted-foreground/30 monospace">
                        #
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8 rounded-xl border border-border/40 shadow-sm group-hover:scale-105 transition-transform duration-500">
                            <AvatarImage src={entry.teacherPhoto ?? undefined} alt={entry.teacherName} />
                            <AvatarFallback className="bg-primary/5 text-[10px] font-black">{entry.teacherName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            'absolute -bottom-1 -right-1 size-2.5 rounded-full border-2 border-card',
                            statusConfig[entry.status].indicatorColor,
                          )}
                          />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight italic">{entry.teacherName}</p>
                          <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">{statusConfig[entry.status].label(t)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <div className={cn(
                        'inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest italic',
                        statusConfig[entry.status].bgColor,
                        statusConfig[entry.status].borderColor,
                        statusConfig[entry.status].color,
                      )}
                      >
                        {(() => {
                          const Icon = statusConfig[entry.status].icon
                          return <Icon className="size-3" />
                        })()}
                        {statusConfig[entry.status].label(t)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Textarea
                        placeholder={t.attendance.notesPlaceholder()}
                        value={entry.notes ?? ''}
                        onChange={e => handleNotesChange(entry.teacherId, e.target.value)}
                        className="min-h-[40px] h-10 py-2 rounded-xl bg-background/50 border-border/40 text-[10px] font-bold italic resize-none focus:min-h-[80px] transition-all"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center justify-end gap-1">
                        {(Object.entries(statusConfig) as [TeacherAttendanceStatus, typeof statusConfig['present']][]).map(([status, config]) => (
                          <StatusButton
                            key={status}
                            active={entry.status === status}
                            onClick={() => handleStatusChange(entry.teacherId, status)}
                            config={config}
                          />
                        ))}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="py-12 flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-primary/5">
              <IconSearch className="size-6 text-primary/20" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-muted-foreground/40 italic">{t.common.noResults()}</h3>
              <p className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest italic">{t.common.trySearchingSomethingElse()}</p>
            </div>
          </div>
        )}
      </CardContent>

      <ConfirmationDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={t.attendance.save()}
        description={t.attendance.saveConfirmDescription()}
        onConfirm={onConfirmSave}
        isPending={isSaving}
        confirmLabel={t.common.save()}
      />
    </Card>
  )
}

function SummaryCard({ label, count, config }: { label: string, count: number, config: typeof statusConfig[TeacherAttendanceStatus] }) {
  const Icon = config.icon
  return (
    <div className={cn(
      'relative overflow-hidden p-3 rounded-2xl border transition-all duration-300 group',
      config.bgColor,
      config.borderColor,
    )}
    >
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform duration-500">
        <Icon className={cn('size-6', config.color)} />
      </div>
      <div className="relative z-10 flex flex-col">
        <span className={cn('text-[8px] font-black uppercase tracking-widest mb-0.5 italic', config.color)}>{label}</span>
        <span className="text-xl font-black italic tabular-nums group-hover:translate-x-1 transition-transform">{count}</span>
      </div>
    </div>
  )
}

function StatusButton({ active, onClick, config }: { active: boolean, onClick: () => void, config: typeof statusConfig[TeacherAttendanceStatus] }) {
  const Icon = config.icon
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      className={cn(
        'h-8 w-8 rounded-xl p-0 transition-all duration-300 relative group overflow-hidden',
        active ? config.bgColor : 'grayscale hover:grayscale-0 hover:bg-card/40',
      )}
    >
      <Icon className={cn('size-3.5 transition-transform group-hover:scale-110 group-active:scale-90', active ? config.color : 'text-muted-foreground/40')} />
      {active && (
        <motion.div
          layoutId="teacher-active-indicator"
          className={cn('absolute inset-0 border-2 rounded-xl', config.borderColor)}
          initial={false}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Button>
  )
}

function TeacherAttendanceGridSkeleton() {
  return (
    <Card className="rounded-3xl border-border/40 bg-card/30">
      <CardHeader className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-7 w-40 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map(() => (
            <Skeleton key={generateUUID()} className="h-12 w-full rounded-2xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
