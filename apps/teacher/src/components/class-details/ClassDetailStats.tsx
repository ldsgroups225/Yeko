import { IconChartBar, IconUsers } from '@tabler/icons-react'
import { Card } from '@workspace/ui/components/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip'
import { useI18nContext } from '@/i18n/i18n-react'

interface ClassDetailStatsProps {
  totalStudents: number
  classAverage: number | null
}

export function ClassDetailStats({ totalStudents, classAverage }: ClassDetailStatsProps) {
  const { LL } = useI18nContext()

  return (
    <div className="grid grid-cols-2 gap-3 mb-8">
      <Card className="flex flex-col p-4 rounded-3xl border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <IconUsers className="w-5 h-5" />
          </div>
          <Tooltip>
            <TooltipTrigger>
              <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-[10px] text-muted-foreground">?</div>
            </TooltipTrigger>
            <TooltipContent>{LL.class_details.totalStudentsHelp()}</TooltipContent>
          </Tooltip>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{LL.common.student_plural()}</p>
          <p className="text-3xl font-black text-foreground lining-nums">{totalStudents}</p>
        </div>
      </Card>

      <Card className="flex flex-col p-4 rounded-3xl border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden relative group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="p-2 rounded-xl bg-success/10 text-success">
            <IconChartBar className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-black text-success uppercase tracking-tighter">{LL.common.active()}</span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{LL.common.classAverage()}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-foreground lining-nums">
              {classAverage !== null ? classAverage.toFixed(1) : '-'}
            </p>
            <span className="text-xs font-bold text-muted-foreground italic">/20</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
