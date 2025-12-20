import { AlertTriangle, Award, Ban, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/i18n'

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
}

export function ConductSummaryCard({ studentName, summary }: ConductSummaryCardProps) {
  const t = useTranslations()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{studentName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-orange-500/10 p-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.incidents}</div>
              <div className="text-xs text-muted-foreground">{t.conduct.type.incident()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-red-500/10 p-2">
              <Ban className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.sanctions}</div>
              <div className="text-xs text-muted-foreground">{t.conduct.type.sanction()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-green-500/10 p-2">
              <Award className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.rewards}</div>
              <div className="text-xs text-muted-foreground">{t.conduct.type.reward()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-500/10 p-2">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.notes}</div>
              <div className="text-xs text-muted-foreground">{t.conduct.type.note()}</div>
            </div>
          </div>
        </div>
        {summary.totalPoints !== undefined && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t.conduct.totalPoints()}</span>
              <span className="text-lg font-bold">{summary.totalPoints}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
