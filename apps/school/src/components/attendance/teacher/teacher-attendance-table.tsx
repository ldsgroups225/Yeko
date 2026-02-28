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
            <TableRow className="
              border-border/10
              hover:bg-transparent
            "
            >
              <TableHead className="
                text-muted-foreground/40 w-[60px] py-4 text-center text-[10px]
                font-black tracking-widest uppercase
              "
              >
                ID
              </TableHead>
              <TableHead className="
                text-muted-foreground/40 min-w-[200px] py-4 text-[10px]
                font-black tracking-widest uppercase
              "
              >
                {t.attendance.teacher()}
              </TableHead>
              <TableHead className="
                text-muted-foreground/40 py-4 text-center text-[10px] font-black
                tracking-widest uppercase
              "
              >
                {t.attendance.status.label()}
              </TableHead>
              <TableHead className="
                text-muted-foreground/40 min-w-[300px] py-4 text-[10px]
                font-black tracking-widest uppercase
              "
              >
                {t.attendance.notes()}
              </TableHead>
              <TableHead className="
                text-muted-foreground/40 min-w-[240px] py-4 text-right
                text-[10px] font-black tracking-widest uppercase
              "
              >
                {t.common.actions()}
              </TableHead>
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
                  className="
                    border-border/5
                    hover:bg-primary/5
                    group transition-colors
                  "
                >
                  <TableCell className="py-2 text-center">
                    <span className="
                      text-muted-foreground/30 monospace text-[10px] font-black
                    "
                    >
                      #
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="
                          border-border/40 h-8 w-8 rounded-xl border shadow-sm
                          transition-transform duration-500
                          group-hover:scale-105
                        "
                        >
                          <AvatarImage src={entry.teacherPhoto ?? undefined} alt={entry.teacherName} />
                          <AvatarFallback className="
                            bg-primary/5 text-[10px] font-black
                          "
                          >
                            {entry.teacherName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          `
                            border-card absolute -right-1 -bottom-1 size-2.5
                            rounded-full border-2
                          `,
                          STATUS_CONFIG[entry.status].indicatorColor,
                        )}
                        />
                      </div>
                      <div>
                        <p className="
                          text-sm font-black tracking-tight uppercase italic
                        "
                        >
                          {entry.teacherName}
                        </p>
                        <p className="
                          text-muted-foreground/40 text-[9px] font-bold
                          tracking-widest uppercase italic
                        "
                        >
                          {STATUS_CONFIG[entry.status].label(t)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-center">
                    <div className={cn(
                      `
                        inline-flex items-center gap-2 rounded-full border
                        px-2.5 py-1 text-[9px] font-black tracking-widest
                        uppercase italic
                      `,
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
                      className="
                        bg-background/50 border-border/40 h-10 min-h-[40px]
                        resize-none rounded-xl py-2 text-[10px] font-bold italic
                        transition-all
                        focus:min-h-[80px]
                      "
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
        <div className="flex flex-col items-center space-y-3 py-12 text-center">
          <div className="bg-primary/5 rounded-full p-3">
            <IconSearch className="text-primary/20 size-6" />
          </div>
          <div>
            <h3 className="
              text-muted-foreground/40 text-base font-black tracking-tight
              uppercase italic
            "
            >
              {t.common.noResults()}
            </h3>
            <p className="
              text-muted-foreground/20 text-[9px] font-bold tracking-widest
              uppercase italic
            "
            >
              {t.common.trySearchingSomethingElse()}
            </p>
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
        `
          group relative h-8 w-8 overflow-hidden rounded-xl p-0 transition-all
          duration-300
        `,
        active
          ? config.bgColor
          : `
            hover:bg-card/40
            grayscale
            hover:grayscale-0
          `,
      )}
    >
      <Icon className={cn(`
        size-3.5 transition-transform
        group-hover:scale-110
        group-active:scale-90
      `, active
        ? config.color
        : `text-muted-foreground/40`)}
      />
      {active && (
        <motion.div
          layoutId="teacher-active-indicator"
          className={cn('absolute inset-0 rounded-xl border-2', config.borderColor)}
          initial={false}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Button>
  )
}
