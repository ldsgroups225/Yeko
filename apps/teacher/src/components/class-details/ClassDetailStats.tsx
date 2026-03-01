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
    <div className="mb-8 grid grid-cols-2 gap-3">
      <Card className="
        border-border/50 bg-card/80 flex flex-col rounded-3xl p-4 shadow-sm
        backdrop-blur-sm
      "
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="bg-primary/10 text-primary rounded-xl p-2">
            <IconUsers className="h-5 w-5" />
          </div>
          <Tooltip>
            <TooltipTrigger>
              <div className="
                border-border text-muted-foreground flex h-6 w-6 items-center
                justify-center rounded-full border text-[10px]
              "
              >
                ?
              </div>
            </TooltipTrigger>
            <TooltipContent>{LL.class_details.totalStudentsHelp()}</TooltipContent>
          </Tooltip>
        </div>
        <div>
          <p className="
            text-muted-foreground mb-1 text-[10px] font-black tracking-widest
            uppercase
          "
          >
            {LL.common.student_plural()}
          </p>
          <p className="text-foreground text-3xl font-black lining-nums">{totalStudents}</p>
        </div>
      </Card>

      <Card className="
        border-border/50 bg-card/80 group relative flex flex-col overflow-hidden
        rounded-3xl p-4 shadow-sm backdrop-blur-sm
      "
      >
        <div className="
          bg-primary/5
          group-hover:bg-primary/10
          absolute -top-4 -right-4 h-24 w-24 rounded-full blur-2xl
          transition-colors
        "
        />
        <div className="relative z-10 mb-4 flex items-center justify-between">
          <div className="bg-success/10 text-success rounded-xl p-2">
            <IconChartBar className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-success h-1 w-1 animate-pulse rounded-full" />
            <span className="
              text-success text-[10px] font-black tracking-tighter uppercase
            "
            >
              {LL.common.active()}
            </span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="
            text-muted-foreground mb-1 text-[10px] font-black tracking-widest
            uppercase
          "
          >
            {LL.common.classAverage()}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-foreground text-3xl font-black lining-nums">
              {classAverage !== null ? classAverage.toFixed(1) : '-'}
            </p>
            <span className="text-muted-foreground text-xs font-bold italic">/20</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
