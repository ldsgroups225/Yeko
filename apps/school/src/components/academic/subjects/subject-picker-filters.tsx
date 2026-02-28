import { IconFilter, IconSearch } from '@tabler/icons-react'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useTranslations } from '@/i18n'
import { useSubjectPicker } from './subject-picker-context'

export function SubjectPickerFilters() {
  const t = useTranslations()
  const { state, actions } = useSubjectPicker()
  const { search, categoryFilter } = state
  const { setSearch, setCategoryFilter } = actions

  const categoryConfig = {
    all: { color: 'bg-gray-400', label: t.academic.subjects.allCategories(), icon: '📚' },
    Scientifique: { color: 'bg-blue-500', label: t.academic.subjects.categories.scientifique(), icon: '🔬' },
    Littéraire: { color: 'bg-green-500', label: t.academic.subjects.categories.litteraire(), icon: '📖' },
    Sportif: { color: 'bg-orange-500', label: t.academic.subjects.categories.sportif(), icon: '⚽' },
    Autre: { color: 'bg-purple-500', label: t.academic.subjects.categories.autre(), icon: '🎨' },
  }

  const currentConfig = categoryConfig[categoryFilter as keyof typeof categoryConfig] || categoryConfig.all

  return (
    <div className="
      border-border/10 flex flex-col gap-4 border-b bg-white/5 px-6 py-4
      sm:flex-row
    "
    >
      <div className="relative flex-1">
        <IconSearch className="
          text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2
        "
        />
        <Input
          placeholder={t.academic.subjects.searchPlaceholder()}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="
            border-border/10
            focus:ring-primary/40
            h-10 bg-white/5 pl-10 text-sm shadow-none transition-all
            focus:bg-white/10
          "
        />
      </div>
      <div className="flex items-center gap-2">
        <IconFilter className="
          text-muted-foreground hidden h-4 w-4
          sm:block
        "
        />
        <Select value={categoryFilter} onValueChange={val => val && setCategoryFilter(val)}>
          <SelectTrigger
            id="category-filter"
            className="
              border-border/10
              focus:ring-primary/40
              h-10 w-full bg-white/5 text-sm shadow-none
              sm:w-[180px]
            "
          >
            <SelectValue placeholder={t.academic.subjects.allCategories()}>
              <div className="flex items-center gap-2">
                <div className={`
                  h-2 w-2 rounded-full
                  ${currentConfig.color}
                `}
                />
                <span>
                  {currentConfig.icon}
                  {' '}
                  {currentConfig.label}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="
            bg-card/95 border-border/10 backdrop-blur-xl
          "
          >
            <SelectItem value="all">{t.academic.subjects.allCategories()}</SelectItem>
            <SelectItem value="Scientifique">{t.academic.subjects.categories.scientifique()}</SelectItem>
            <SelectItem value="Littéraire">{t.academic.subjects.categories.litteraire()}</SelectItem>
            <SelectItem value="Sportif">{t.academic.subjects.categories.sportif()}</SelectItem>
            <SelectItem value="Autre">{t.academic.subjects.categories.autre()}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
