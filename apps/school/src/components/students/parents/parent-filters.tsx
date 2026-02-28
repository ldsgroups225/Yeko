import { IconPlus, IconSearch, IconUserPlus } from '@tabler/icons-react'
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

interface ParentFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: any) => void
  onAutoMatch: () => void
  onAddParent: () => void
}

export function ParentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onAutoMatch,
  onAddParent,
}: ParentFiltersProps) {
  const t = useTranslations()

  return (
    <div className="
      flex flex-col gap-4
      sm:flex-row sm:items-center sm:justify-between
    "
    >
      <div className="flex flex-1 gap-2">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="
            text-muted-foreground absolute top-1/2 left-3 h-4 w-4
            -translate-y-1/2
          "
          />
          <Input
            placeholder={t.parents.searchPlaceholder()}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.parents.filterByStatus()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.all()}</SelectItem>
            <SelectItem value="pending">{t.parents.statusPending()}</SelectItem>
            <SelectItem value="sent">{t.parents.statusSent()}</SelectItem>
            <SelectItem value="accepted">{t.parents.statusAccepted()}</SelectItem>
            <SelectItem value="expired">{t.parents.statusExpired()}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onAutoMatch}>
          <IconUserPlus className="mr-2 h-4 w-4" />
          {t.students.autoMatch()}
        </Button>
        <Button onClick={onAddParent}>
          <IconPlus className="mr-2 h-4 w-4" />
          {t.parents.addParent()}
        </Button>
      </div>
    </div>
  )
}
