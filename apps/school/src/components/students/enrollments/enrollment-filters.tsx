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

interface EnrollmentFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: any) => void
  classId: string
  onClassChange: (value: string) => void
  classesData: any[] | undefined
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
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t.enrollments.filterByStatus()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.all()}</SelectItem>
            <SelectItem value="pending">{t.enrollments.statusPending()}</SelectItem>
            <SelectItem value="confirmed">{t.enrollments.statusConfirmed()}</SelectItem>
            <SelectItem value="cancelled">{t.enrollments.statusCancelled()}</SelectItem>
            <SelectItem value="transferred">{t.enrollments.statusTransferred()}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classId} onValueChange={v => onClassChange(v as string)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.enrollments.filterByClass()} />
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
