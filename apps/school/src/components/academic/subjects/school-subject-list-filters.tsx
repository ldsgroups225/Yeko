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
      className="
        border-border/40 bg-card/50 flex flex-col gap-4 rounded-xl border p-4
        backdrop-blur-xl
        sm:flex-row sm:items-center sm:justify-between
      "
    >
      <div className="flex flex-1 gap-3">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="
            text-muted-foreground absolute top-1/2 left-3 h-4 w-4
            -translate-y-1/2
          "
          />
          <Input
            placeholder={t.academic.subjects.searchPlaceholder()}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="
              border-border/40 bg-card/50
              focus:bg-card/80
              pl-9 shadow-none transition-all
            "
          />
        </div>

        <Popover>
          <PopoverTrigger
            render={(
              <Button
                variant="outline"
                className="
                  border-border/40 bg-card/50
                  hover:bg-card/80
                  shadow-none backdrop-blur-sm
                "
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
            className="
              bg-popover/90 border-border/40 w-80 space-y-4 border p-4
              backdrop-blur-2xl
            "
            align="start"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="
                  text-muted-foreground text-xs leading-none font-medium
                  tracking-wider uppercase
                "
                >
                  {t.common.filters()}
                </h4>
                {isFiltered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-primary h-6 px-2 text-[10px]"
                  >
                    {t.common.clearFilters()}
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[11px]">
                    {t.academic.subjects.filterByCategory()}
                  </Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={val => val && setCategoryFilter(val)}
                  >
                    <SelectTrigger className="
                      bg-card/50 border-border/40 h-8 text-xs
                    "
                    >
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
                  <Label className="text-muted-foreground text-[11px]">
                    {t.academic.subjects.filterByStatus()}
                  </Label>
                  <Select
                    value={statusFilter}
                    onValueChange={val => val && setStatusFilter(val)}
                  >
                    <SelectTrigger className="
                      bg-card/50 border-border/40 h-8 text-xs
                    "
                    >
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

              <div className="border-border/40 space-y-2 border-t pt-2">
                <h4 className="
                  text-muted-foreground mb-3 text-xs leading-none font-medium
                  tracking-wider uppercase
                "
                >
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
        className="shadow-primary/20 shadow-lg"
      >
        <IconPlus className="mr-2 h-4 w-4" />
        {t.academic.subjects.addSubjects()}
      </Button>
    </motion.div>
  )
}
