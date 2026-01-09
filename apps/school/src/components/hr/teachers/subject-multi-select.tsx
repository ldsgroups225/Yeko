import { IconBook, IconCheck, IconLoader2, IconSearch, IconSelector, IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { getAllSubjects } from '@/school/functions/subjects'

interface Subject {
  id: string
  name: string
  shortName: string
  category: string
}

interface SubjectMultiSelectProps {
  value?: string[]
  onChange: (value: string[]) => void
}

const DEFAULT_VALUE: string[] = []

export function SubjectMultiSelect({ value = DEFAULT_VALUE, onChange }: SubjectMultiSelectProps) {
  const t = useTranslations()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['subjects', search],
    queryFn: async () => {
      const result = await getAllSubjects({ data: { search } })
      return result
    },
  })

  const subjects = (data?.subjects || []) as Subject[]
  const selectedSubjects = subjects.filter((s: Subject) => value.includes(s.id))

  const handleSelect = (subjectId: string) => {
    if (value.includes(subjectId)) {
      onChange(value.filter(id => id !== subjectId))
    }
    else {
      onChange([...value, subjectId])
    }
  }

  const handleRemove = (subjectId: string) => {
    onChange(value.filter(id => id !== subjectId))
  }

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls="subject-list"
            className={cn(
              'w-full justify-between font-medium rounded-xl h-11 border-border/40 bg-background/50 hover:bg-background transition-all shadow-sm',
              open && 'ring-2 ring-primary/20 border-primary/50 bg-background',
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <IconBook className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {value.length > 0
                  ? `${value.length} ${t.hr.teachers.subjects().toLowerCase()}`
                  : t.hr.teachers.selectSubjects()}
              </span>
            </div>
            <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0 rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40 shadow-xl overflow-hidden" align="start">
          <Command className="bg-transparent" shouldFilter={false}>
            <div className="relative border-b border-border/40">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <CommandInput
                placeholder={t.common.search()}
                value={search}
                onValueChange={setSearch}
                className="border-none focus:ring-0 pl-9 py-4 h-11 bg-transparent"
              />
            </div>
            <CommandList id="subject-list">
              <AnimatePresence mode="wait">
                {isLoading
                  ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center py-8"
                      >
                        <IconLoader2 className="h-5 w-5 animate-spin text-primary/60" />
                      </motion.div>
                    )
                  : subjects.length === 0
                    ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-10 text-center"
                        >
                          <CommandEmpty className="text-sm text-muted-foreground">
                            {t.common.noResults()}
                          </CommandEmpty>
                        </motion.div>
                      )
                    : (
                        <CommandGroup className="p-2">
                          {subjects.map((subject: Subject) => (
                            <CommandItem
                              key={subject.id}
                              value={subject.id}
                              onSelect={() => handleSelect(subject.id)}
                              className="rounded-lg py-3 px-3 cursor-pointer data-[selected=true]:bg-primary/10 transition-colors"
                            >
                              <div className="flex items-center w-full">
                                <div className={cn(
                                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full mr-3 border transition-colors',
                                  value.includes(subject.id) ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border/40 text-muted-foreground',
                                )}
                                >
                                  {value.includes(subject.id)
                                    ? (
                                        <IconCheck className="h-4 w-4" />
                                      )
                                    : (
                                        <IconBook className="h-4 w-4" />
                                      )}
                                </div>
                                <div className="flex flex-col flex-1 truncate">
                                  <span className="font-semibold text-foreground truncate">{subject.name}</span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {subject.shortName}
                                    {' '}
                                    •
                                    {subject.category}
                                  </span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
              </AnimatePresence>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <AnimatePresence>
        {selectedSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10"
          >
            {selectedSubjects.map((subject: Subject) => (
              <motion.div
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                key={subject.id}
              >
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1 py-1 gap-2 rounded-lg bg-card border-border/40 shadow-sm group hover:border-primary/30 transition-colors"
                >
                  <span className="text-xs font-semibold">{subject.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(subject.id)}
                    className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
