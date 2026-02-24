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
    <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 bg-white/5 border-b border-border/10">
      <div className="relative flex-1">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.academic.subjects.searchPlaceholder()}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-white/5 border-border/10 focus:ring-primary/40 shadow-none text-sm transition-all focus:bg-white/10"
        />
      </div>
      <div className="flex items-center gap-2">
        <IconFilter className="h-4 w-4 text-muted-foreground hidden sm:block" />
        <Select value={categoryFilter} onValueChange={val => val && setCategoryFilter(val)}>
          <SelectTrigger id="category-filter" className="w-full sm:w-[180px] h-10 bg-white/5 border-border/10 focus:ring-primary/40 shadow-none text-sm">
            <SelectValue placeholder={t.academic.subjects.allCategories()}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${currentConfig.color}`} />
                <span>
                  {currentConfig.icon}
                  {' '}
                  {currentConfig.label}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="backdrop-blur-xl bg-card/95 border-border/10">
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
