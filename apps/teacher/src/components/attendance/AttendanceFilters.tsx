import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { lazy, Suspense } from 'react'
import { useI18nContext } from '@/i18n/i18n-react'

const DatePicker = lazy(() => import('@workspace/ui/components/date-picker').then(m => ({ default: m.DatePicker })))

interface AttendanceFiltersProps {
  selectedClassId: string
  setSelectedClassId: (id: string) => void
  selectedDate: string
  setSelectedDate: (date: string) => void
  classes: { id: string, name: string }[] | undefined
  counts: {
    total: number
    present: number
    absent: number
    late: number
    excused: number
    notMarked: number
  } | null
}

export function AttendanceFilters({
  selectedClassId,
  setSelectedClassId,
  selectedDate,
  setSelectedDate,
  classes,
  counts,
}: AttendanceFiltersProps) {
  const { LL } = useI18nContext()

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {LL.attendance.selectClass()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">
              {LL.attendance.class()}
            </label>
            <select
              className="w-full mt-1 border rounded-md p-2"
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
            >
              <option value="">
                {LL.attendance.selectClass()}
              </option>
              {classes?.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">
              {LL.attendance.date()}
            </label>
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <DatePicker
                date={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={(date: Date | undefined) => setSelectedDate(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                className="w-full mt-1 border rounded-md p-2 justify-start font-normal"
              />
            </Suspense>
          </div>
        </div>

        {counts && (
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">
              {LL.attendance.total()}
              :
              {counts.total}
            </Badge>
            <Badge className="bg-success/10 text-success">
              {LL.attendance.present()}
              :
              {counts.present}
            </Badge>
            <Badge className="bg-destructive/10 text-destructive">
              {LL.attendance.absent()}
              :
              {counts.absent}
            </Badge>
            <Badge className="bg-accent/10 text-accent-foreground">
              {LL.attendance.late()}
              :
              {counts.late}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
