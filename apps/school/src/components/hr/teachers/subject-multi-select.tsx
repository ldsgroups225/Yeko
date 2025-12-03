import { useQuery } from '@tanstack/react-query'
import { CheckIcon, ChevronsUpDownIcon, Loader2, XIcon } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  const { t } = useTranslation()
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
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls="subject-list"
            className="w-full justify-between"
          >
            <span className="truncate">
              {value.length > 0
                ? `${value.length} ${t('hr.teachers.subjects').toLowerCase()}`
                : t('hr.teachers.selectSubjects')}
            </span>
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={t('common.search')}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {isLoading
                ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )
                : (
                    <>
                      <CommandEmpty>{t('common.noResults')}</CommandEmpty>
                      <CommandGroup id="subject-list">
                        {subjects.map((subject: Subject) => (
                          <CommandItem
                            key={subject.id}
                            value={subject.id}
                            onSelect={() => handleSelect(subject.id)}
                          >
                            <CheckIcon
                              className={`mr-2 h-4 w-4 ${value.includes(subject.id) ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            <div className="flex flex-col">
                              <span>{subject.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {subject.shortName}
                                {' '}
                                •
                                {' '}
                                {subject.category}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSubjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSubjects.map((subject: Subject) => (
            <Badge key={subject.id} variant="secondary" className="gap-1">
              {subject.name}
              <button
                type="button"
                onClick={() => handleRemove(subject.id)}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
