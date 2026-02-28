import { IconAlertCircle, IconChevronsDown, IconChevronsUp, IconPercentage, IconStar, IconTrendingUp, IconUsers } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

interface GradeStatistics {
  count: number
  average: number
  min: number
  max: number
  below10: number
  above15: number
}

interface GradeStatisticsCardProps {
  statistics: GradeStatistics
  className?: string
}

export function GradeStatisticsCard({ statistics, className }: GradeStatisticsCardProps) {
  const t = useTranslations()
  const passRate = statistics.count > 0
    ? Math.round(((statistics.count - statistics.below10) / statistics.count) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn(`
        border-border/40 bg-card/30 overflow-hidden rounded-2xl shadow-xl
        backdrop-blur-xl
      `, className)}
      >
        <CardHeader className="border-border/20 bg-muted/20 border-b pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="
                bg-primary/10 text-primary flex h-10 w-10 items-center
                justify-center rounded-xl shadow-inner
              "
              >
                <IconTrendingUp className="size-5" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">{t.academic.grades.statistics.title()}</CardTitle>
            </div>
            <div className="
              bg-success/10 text-success border-success/20 flex items-center
              gap-2 rounded-full border px-3 py-1
            "
            >
              <IconPercentage className="size-3.5" />
              <span className="
                text-[10px] leading-none font-bold tracking-widest uppercase
              "
              >
                {t.academic.grades.statistics.passRate()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="
            mb-8 grid grid-cols-2 gap-4
            sm:grid-cols-3
            lg:grid-cols-6
          "
          >
            <StatItem
              label={t.academic.grades.statistics.gradeCount()}
              value={statistics.count}
              icon={IconUsers}
              color="bg-primary/10 text-primary"
            />
            <StatItem
              label={t.academic.grades.statistics.classAverage()}
              value={statistics.average.toFixed(2)}
              icon={IconTrendingUp}
              color={getAverageBgColor(statistics.average)}
              valueClassName={getAverageTextColor(statistics.average)}
            />
            <StatItem
              label={t.academic.grades.statistics.min()}
              value={statistics.min.toFixed(2)}
              icon={IconChevronsDown}
              color="bg-accent/10 text-accent-foreground"
              valueClassName="text-accent-foreground"
            />
            <StatItem
              label={t.academic.grades.statistics.max()}
              value={statistics.max.toFixed(2)}
              icon={IconChevronsUp}
              color="bg-indigo-500/10 text-indigo-600"
              valueClassName="text-indigo-600"
            />
            <StatItem
              label={t.academic.grades.statistics.below10()}
              value={statistics.below10}
              icon={IconAlertCircle}
              color="bg-destructive/10 text-destructive"
              valueClassName="text-destructive"
            />
            <StatItem
              label={t.academic.grades.statistics.above15()}
              value={statistics.above15}
              icon={IconStar}
              color="bg-success/10 text-success"
              valueClassName="text-success"
            />
          </div>

          <div className="
            bg-muted/30 border-border/20 group relative overflow-hidden
            rounded-2xl border p-6 shadow-inner
          "
          >
            <div className="
              relative z-10 mb-4 flex items-center justify-between
            "
            >
              <div className="space-y-1">
                <span className="
                  text-muted-foreground text-[10px] font-bold tracking-[0.2em]
                  uppercase opacity-70
                "
                >
                  {t.academic.grades.statistics.passRate()}
                </span>
                <p className="
                  text-foreground text-2xl font-bold tracking-tighter
                "
                >
                  {passRate}
                  %
                  <span className="
                    text-muted-foreground ml-1 text-xs font-medium
                    tracking-normal
                  "
                  >
                    de réussite
                  </span>
                </p>
              </div>
              <div className={cn(
                `
                  flex h-12 w-12 items-center justify-center rounded-2xl border
                  shadow-lg transition-transform duration-500
                  group-hover:scale-110
                `,
                passRate >= 50
                  ? 'bg-success/10 text-success border-success/20'
                  : `bg-destructive/10 text-destructive border-destructive/20`,
              )}
              >
                <IconTrendingUp className={cn('size-6', passRate < 50 && `
                  rotate-180
                `)}
                />
              </div>
            </div>

            <div className="
              bg-background/50 border-border/10 relative h-3 w-full
              overflow-hidden rounded-full border shadow-inner
            "
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${passRate}%` }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className={cn(
                  'relative h-full transition-colors duration-1000',
                  passRate >= 80
                    ? 'bg-indigo-500'
                    : passRate >= 50
                      ? `bg-success`
                      : `bg-destructive`,
                )}
              >
                <div className="
                  animate-shimmer absolute inset-0
                  bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)]
                  bg-size-[200%_100%]
                "
                />
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StatItem({
  label,
  value,
  icon: Icon,
  valueClassName,
  color,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  valueClassName?: string
  color?: string
}) {
  return (
    <div className="group flex flex-col items-center text-center">
      <div className={cn(
        `
          border-border/10 mb-3 rounded-xl border p-2.5 shadow-sm transition-all
          duration-300
          group-hover:scale-110 group-hover:shadow-md
        `,
        color || 'bg-background/50 text-muted-foreground',
      )}
      >
        <Icon className="size-4.5" />
      </div>
      <p className="
        text-muted-foreground/60
        group-hover:text-muted-foreground
        mb-1 text-[10px] font-bold tracking-widest uppercase transition-colors
      "
      >
        {label}
      </p>
      <p className={cn('text-xl font-bold tracking-tight tabular-nums', valueClassName || `
        text-foreground
      `)}
      >
        {value}
      </p>
    </div>
  )
}

function getAverageBgColor(average: number): string {
  if (average >= 16)
    return 'bg-indigo-500/10 text-indigo-600'
  if (average >= 14)
    return 'bg-success/10 text-success'
  if (average >= 10)
    return 'bg-primary/10 text-primary'
  return 'bg-destructive/10 text-destructive'
}

function getAverageTextColor(average: number): string {
  if (average >= 16)
    return 'text-indigo-600 font-black'
  if (average >= 14)
    return 'text-success font-black'
  if (average >= 10)
    return 'text-primary font-bold'
  return 'text-destructive font-black'
}
