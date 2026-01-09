import { IconAlertTriangle, IconAward, IconBan, IconFileText, IconUserCircle } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

interface ConductSummary {
  incidents: number
  sanctions: number
  rewards: number
  notes: number
  totalPoints?: number
}

interface ConductSummaryCardProps {
  studentName: string
  summary: ConductSummary
  className?: string
}

export function ConductSummaryCard({ studentName, summary, className }: ConductSummaryCardProps) {
  const t = useTranslations()

  const stats = [
    { label: t.conduct.type.incident(), value: summary.incidents, icon: IconAlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: t.conduct.type.sanction(), value: summary.sanctions, icon: IconBan, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: t.conduct.type.reward(), value: summary.rewards, icon: IconAward, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: t.conduct.type.note(), value: summary.notes, icon: IconFileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl', className)}>
        <CardHeader className="bg-muted/20 border-b border-border/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-background/50 text-muted-foreground shadow-sm">
              <IconUserCircle className="size-4" />
            </div>
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">{studentName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 transition-transform hover:scale-105"
              >
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner border border-white/10 transition-transform duration-500', stat.bg, stat.color)}>
                  <stat.icon className="size-6" />
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight leading-none">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
          {summary.totalPoints !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 pt-6 border-t border-border/20"
            >
              <div className="flex justify-between items-center rounded-2xl bg-primary/5 p-4 border border-primary/10">
                <span className="text-xs font-black uppercase tracking-widest text-primary/70">{t.conduct.totalPoints()}</span>
                <span className="text-2xl font-black text-primary tracking-tighter">{summary.totalPoints}</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
