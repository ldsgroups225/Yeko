import {
  IconAdjustmentsHorizontal,
  IconDownload,
  IconPlus,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
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
import { useClassesTable } from './classes-table-context'

export function ClassesTableFilters() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { state, actions } = useClassesTable()
  const { searchInput, status, isFiltered, selectedRows } = state
  const { setSearchInput, setStatus, handleClearFilters, setIsAddDialogOpen } = actions

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
            placeholder={t.common.search()}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
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
                {status && status !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 rounded-full px-1.5 text-xs"
                  >
                    1
                  </Badge>
                )}
              </Button>
            )}
          />
          <PopoverContent
            className="w-80 p-4 space-y-4 backdrop-blur-2xl bg-popover/90 border border-border/40"
            align="start"
          >
            <div className="space-y-2">
              <h4 className="font-medium leading-none text-muted-foreground text-xs mb-3 uppercase tracking-wider">
                {t.common.filters()}
              </h4>
              <Label>{t.classes.status()}</Label>
              <Select
                value={status}
                onValueChange={val => val && setStatus(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t.classes.status()}>
                    {status
                      ? (() => {
                          const statusConfig = {
                            all: { color: 'bg-gray-400', label: t.common.all(), icon: '⚫' },
                            active: { color: 'bg-emerald-500', label: t.common.active(), icon: '🟢' },
                            archived: { color: 'bg-slate-400', label: t.common.archived(), icon: '⚫' },
                          }
                          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.all
                          return (
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${config.color}`} />
                              <span>
                                {config.icon}
                                {' '}
                                {config.label}
                              </span>
                            </div>
                          )
                        })()
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.common.all()}</SelectItem>
                  <SelectItem value="active">{t.common.active()}</SelectItem>
                  <SelectItem value="archived">
                    {t.common.archived()}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status && status !== 'all' && (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleClearFilters}
              >
                {t.common.refresh()}
              </Button>
            )}

            <div className="pt-4 border-t border-border/40 space-y-2">
              <h4 className="font-medium leading-none text-muted-foreground text-xs mb-3 uppercase tracking-wider">
                {t.common.quickActions()}
              </h4>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/classes/assignments' })}
                className="w-full justify-start text-sm"
              >
                <IconPlus className="mr-2 h-4 w-4" />
                {t.academic.assignments.title()}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => toast.info(t.common.comingSoon())}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                {t.common.export()}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10"
          >
            <IconX className="mr-2 h-4 w-4" />
            {t.common.refresh()}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedRows.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-none"
          >
            {selectedRows.length}
            {' '}
            {t.common.selected()}
          </Button>
        )}

        <Button
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          {t.classes.addClass()}
        </Button>
      </div>
    </motion.div>
  )
}
