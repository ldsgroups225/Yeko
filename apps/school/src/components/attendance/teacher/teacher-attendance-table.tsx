import type { TeacherAttendanceStatus } from './types'
import { IconSearch } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
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
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { useTeacherAttendance } from './teacher-attendance-context'
import { STATUS_CONFIG } from './types'

export function TeacherAttendanceTable() {
  const t = useTranslations()
  const { state, actions } = useTeacherAttendance()
  const { filteredEntries } = state
  const { handleStatusChange, handleNotesChange } = actions

  return (
    <>
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
                          STATUS_CONFIG[entry.status].indicatorColor,
                        )}
                        />
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight italic">{entry.teacherName}</p>
                        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">{STATUS_CONFIG[entry.status].label(t)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-2">
                    <div className={cn(
                      'inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest italic',
                      STATUS_CONFIG[entry.status].bgColor,
                      STATUS_CONFIG[entry.status].borderColor,
                      STATUS_CONFIG[entry.status].color,
                    )}
                    >
                      {(() => {
                        const Icon = STATUS_CONFIG[entry.status].icon
                        return <Icon className="size-3" />
                      })()}
                      {STATUS_CONFIG[entry.status].label(t)}
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
                      {(Object.entries(STATUS_CONFIG) as [TeacherAttendanceStatus, typeof STATUS_CONFIG['present']][]).map(([status, config]) => (
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
    </>
  )
}

function StatusButton({ active, onClick, config }: { active: boolean, onClick: () => void, config: typeof STATUS_CONFIG[TeacherAttendanceStatus] }) {
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
