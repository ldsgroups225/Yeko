import {
  IconAdjustmentsHorizontal,
  IconDownload,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { useSchoolSubjectList } from './school-subject-list-context'
import { SUBJECT_CATEGORY_KEYS } from './use-school-subject-columns'

export function SchoolSubjectListFilters() {
  const t = useTranslations()
  const { state, actions } = useSchoolSubjectList()
  const { search, categoryFilter, statusFilter, isFiltered } = state
  const { setSearch, setCategoryFilter, setStatusFilter, setPickerOpen, handleClearFilters } = actions

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-1 gap-3">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.academic.subjects.searchPlaceholder()}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-border/40 bg-card/50 pl-9 transition-all focus:bg-card/80 shadow-none"
          />
        </div>

        <Popover>
          <PopoverTrigger
            render={(
              <Button
                variant="outline"
                className="border-border/40 bg-card/50 backdrop-blur-sm shadow-none hover:bg-card/80"
              >
                <IconAdjustmentsHorizontal className="mr-2 h-4 w-4" />
                {t.common.actions()}
                {isFiltered && (
                  <Badge className="ml-2 h-2 w-2 rounded-full p-0" />
                )}
              </Button>
            )}
          />
          <PopoverContent
            className="w-80 p-4 space-y-4 backdrop-blur-2xl bg-popover/90 border border-border/40"
            align="start"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none text-muted-foreground text-xs uppercase tracking-wider">
                  {t.common.filters()}
                </h4>
                {isFiltered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-6 px-2 text-[10px] text-primary"
                  >
                    {t.common.clearFilters()}
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-[11px] text-muted-foreground">
                    {t.academic.subjects.filterByCategory()}
                  </Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={val => val && setCategoryFilter(val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-card/50 border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t.academic.subjects.allCategories()}
                      </SelectItem>
                      {SUBJECT_CATEGORY_KEYS.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {t.academic.subjects.categories[cat]()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] text-muted-foreground">
                    {t.academic.subjects.filterByStatus()}
                  </Label>
                  <Select
                    value={statusFilter}
                    onValueChange={val => val && setStatusFilter(val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-card/50 border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t.academic.subjects.allStatus()}
                      </SelectItem>
                      <SelectItem value="active">
                        {t.academic.subjects.status.active()}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t.academic.subjects.status.inactive()}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 space-y-2">
                <h4 className="font-medium leading-none text-muted-foreground text-xs mb-3 uppercase tracking-wider">
                  {t.common.quickActions()}
                </h4>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => toast.info(t.common.comingSoon())}
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  {t.common.export()}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button
        onClick={() => setPickerOpen(true)}
        className="shadow-lg shadow-primary/20"
      >
        <IconPlus className="mr-2 h-4 w-4" />
        {t.academic.subjects.addSubjects()}
      </Button>
    </motion.div>
  )
}
