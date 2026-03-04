import { IconRefresh, IconSearch } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useTranslations } from '@/i18n'

type EnrollmentStatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'transferred'

interface EnrollmentClassOption {
  class: {
    id: string
    section: string | null
  }
  grade: {
    name: string | null
  }
  series: {
    name: string | null
  } | null
}

interface EnrollmentFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: EnrollmentStatusFilter
  onStatusChange: (value: EnrollmentStatusFilter) => void
  classId: string
  onClassChange: (value: string) => void
  classesData: EnrollmentClassOption[] | undefined
  onBulkReEnroll: () => void
}

export function EnrollmentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  classId,
  onClassChange,
  classesData,
  onBulkReEnroll,
}: EnrollmentFiltersProps) {
  const t = useTranslations()
  const selectedClass = classesData?.find(cls => cls.class.id === classId)
  const selectedClassLabel = selectedClass
    ? `${selectedClass.grade.name || ''} ${selectedClass.class.section || ''}${selectedClass.series?.name ? ` (${selectedClass.series.name})` : ''}`.trim()
    : undefined

  const statusLabels: Record<EnrollmentStatusFilter, string> = {
    all: t.common.all(),
    pending: t.enrollments.statusPending(),
    confirmed: t.enrollments.statusConfirmed(),
    cancelled: t.enrollments.statusCancelled(),
    transferred: t.enrollments.statusTransferred(),
  }

  return (
    <div className="
      flex flex-col gap-4
      sm:flex-row sm:items-center sm:justify-between
    "
    >
      <div className="flex flex-1 flex-wrap gap-2">
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <IconSearch className="
            text-muted-foreground absolute top-1/2 left-3 h-4 w-4
            -translate-y-1/2
          "
          />
          <Input
            placeholder={t.enrollments.searchPlaceholder()}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            if (value) {
              onStatusChange(value)
            }
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t.enrollments.filterByStatus()}>
              {status
                ? (
                    <span className="truncate">{statusLabels[status]}</span>
                  )
                : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.all()}</SelectItem>
            <SelectItem value="pending">{t.enrollments.statusPending()}</SelectItem>
            <SelectItem value="confirmed">{t.enrollments.statusConfirmed()}</SelectItem>
            <SelectItem value="cancelled">{t.enrollments.statusCancelled()}</SelectItem>
            <SelectItem value="transferred">{t.enrollments.statusTransferred()}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={classId}
          onValueChange={(value) => {
            if (value) {
              onClassChange(value)
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.enrollments.filterByClass()}>
              {classId !== 'all' && selectedClassLabel
                ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary size-2 rounded-full" />
                      <span className="truncate">{selectedClassLabel}</span>
                    </div>
                  )
                : (
                    <span className="truncate">{t.common.all()}</span>
                  )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.all()}</SelectItem>
            {classesData?.map(cls => (
              <SelectItem key={cls.class.id} value={cls.class.id}>
                {cls.grade.name}
                {' '}
                {cls.class.section}
                {cls.series?.name ? ` (${cls.series.name})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBulkReEnroll}>
          <IconRefresh className="mr-2 h-4 w-4" />
          {t.students.bulkReEnroll()}
        </Button>
      </div>
    </div>
  )
}
