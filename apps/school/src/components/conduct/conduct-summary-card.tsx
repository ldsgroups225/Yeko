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
    { label: t.conduct.type.incident(), value: summary.incidents, icon: IconAlertTriangle, color: 'text-accent-foreground', bg: 'bg-accent/10' },
    { label: t.conduct.type.sanction(), value: summary.sanctions, icon: IconBan, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: t.conduct.type.reward(), value: summary.rewards, icon: IconAward, color: 'text-success', bg: 'bg-success/10' },
    { label: t.conduct.type.note(), value: summary.notes, icon: IconFileText, color: 'text-secondary', bg: 'bg-secondary/10' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(`
        border-border/40 bg-card/30 overflow-hidden rounded-3xl shadow-xl
        backdrop-blur-xl
      `, className)}
      >
        <CardHeader className="bg-muted/20 border-border/20 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="
              bg-background/50 text-muted-foreground rounded-xl p-2 shadow-sm
            "
            >
              <IconUserCircle className="size-4" />
            </div>
            <CardTitle className="text-sm font-black tracking-[0.2em] uppercase">{studentName}</CardTitle>
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
                className="
                  flex items-center gap-4 transition-transform
                  hover:scale-105
                "
              >
                <div className={cn(`
                  flex h-12 w-12 shrink-0 items-center justify-center
                  rounded-2xl border border-white/10 shadow-inner
                  transition-transform duration-500
                `, stat.bg, stat.color)}
                >
                  <stat.icon className="size-6" />
                </div>
                <div>
                  <div className="
                    text-2xl leading-none font-black tracking-tight
                  "
                  >
                    {stat.value}
                  </div>
                  <div className="
                    text-muted-foreground/60 mt-1 text-[10px] font-black
                    tracking-widest uppercase
                  "
                  >
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {summary.totalPoints !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="border-border/20 mt-6 border-t pt-6"
            >
              <div className="
                bg-primary/5 border-primary/10 flex items-center justify-between
                rounded-2xl border p-4
              "
              >
                <span className="
                  text-primary/70 text-xs font-black tracking-widest uppercase
                "
                >
                  {t.conduct.totalPoints()}
                </span>
                <span className="
                  text-primary text-2xl font-black tracking-tighter
                "
                >
                  {summary.totalPoints}
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
