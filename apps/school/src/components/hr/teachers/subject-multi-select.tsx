import {
  IconBook,
  IconCheck,
  IconLoader2,
  IconSearch,
  IconSelector,
  IconX,
} from '@tabler/icons-react'
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
import { getAllSubjectsOfTheSchoolThisCurrentYear } from '@/school/functions/subjects'

interface SubjectMultiSelectProps {
  value?: string[]
  onChange: (value: string[]) => void
}

const DEFAULT_VALUE: string[] = []

export function SubjectMultiSelect({
  value = DEFAULT_VALUE,
  onChange,
}: SubjectMultiSelectProps) {
  const t = useTranslations()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const { data, isPending } = useQuery({
    queryKey: ['subjects', search],
    queryFn: async () => {
      const result = await getAllSubjectsOfTheSchoolThisCurrentYear({ data: { search } })
      return result
    },
  })

  const subjectsData = data?.success ? data.data : undefined
  const subjects = subjectsData?.subjects || []
  const selectedSubjects = subjects.filter(s =>
    value.includes(s.id),
  )

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
        <PopoverTrigger
          render={(
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-controls="subject-list"
              className={cn(
                `
                  border-border/40 bg-background/50
                  hover:bg-background
                  h-11 w-full justify-between rounded-xl font-medium shadow-sm
                  transition-all
                `,
                open
                && 'ring-primary/20 border-primary/50 bg-background ring-2',
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <IconBook className="text-muted-foreground h-4 w-4" />
                <span className="truncate">
                  {value.length > 0
                    ? `${value.length} ${t.hr.teachers.subjects().toLowerCase()}`
                    : t.hr.teachers.selectSubjects()}
                </span>
              </div>
              <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          )}
        />
        <PopoverContent
          className="
            bg-popover/90 border-border/40 w-(--radix-popover-trigger-width)
            overflow-hidden rounded-xl p-0 shadow-xl backdrop-blur-2xl
          "
          align="start"
        >
          <Command className="bg-transparent" shouldFilter={false}>
            <div className="border-border/40 relative border-b">
              <IconSearch className="
                text-muted-foreground absolute top-1/2 left-3 h-4 w-4
                -translate-y-1/2
              "
              />
              <CommandInput
                placeholder={t.common.search()}
                value={search}
                onValueChange={setSearch}
                className="
                  h-11 border-none bg-transparent py-4 pl-9
                  focus:ring-0
                "
              />
            </div>
            <CommandList id="subject-list">
              <AnimatePresence mode="wait">
                {isPending
                  ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center py-8"
                      >
                        <IconLoader2 className="
                          text-primary/60 h-5 w-5 animate-spin
                        "
                        />
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
                          <CommandEmpty className="
                            text-muted-foreground text-sm
                          "
                          >
                            {t.common.noResults()}
                          </CommandEmpty>
                        </motion.div>
                      )
                    : (
                        <CommandGroup className="p-2">
                          {subjects.map(subject => (
                            <CommandItem
                              key={subject.id}
                              value={subject.id}
                              onSelect={() => handleSelect(subject.id)}
                              className="
                                data-[selected=true]:bg-primary/10
                                cursor-pointer rounded-lg px-3 py-3
                                transition-colors
                              "
                            >
                              <div className="flex w-full items-center">
                                <div
                                  className={cn(
                                    `
                                      mr-3 flex h-8 w-8 shrink-0 items-center
                                      justify-center rounded-full border
                                      transition-colors
                                    `,
                                    value.includes(subject.id)
                                      ? `
                                        bg-primary border-primary
                                        text-primary-foreground
                                      `
                                      : `
                                        bg-muted border-border/40
                                        text-muted-foreground
                                      `,
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
                                <div className="flex flex-1 flex-col truncate">
                                  <span className="
                                    text-foreground truncate font-semibold
                                  "
                                  >
                                    {subject.name}
                                  </span>
                                  <span className="
                                    text-muted-foreground truncate text-xs
                                  "
                                  >
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
            className="
              bg-primary/5 border-primary/10 flex flex-wrap gap-2 rounded-xl
              border p-3
            "
          >
            {selectedSubjects.map(subject => (
              <motion.div
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                key={subject.id}
              >
                <Badge
                  variant="ghost"
                  className="
                    bg-card border-border/40 group
                    hover:border-primary/30
                    gap-2 rounded-lg py-1 pr-1 pl-3 shadow-sm transition-colors
                  "
                >
                  <span className="text-xs font-semibold">{subject.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(subject.id)}
                    className="
                      hover:bg-destructive/10 hover:text-destructive
                      flex h-5 w-5 items-center justify-center rounded-md
                      transition-colors
                    "
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
