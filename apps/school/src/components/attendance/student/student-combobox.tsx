import { IconCheck, IconLoader2, IconSelector } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
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
import * as React from 'react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { getStudents } from '@/school/functions/students'

interface Student {
  id: string
  matricule: string | null
  user: {
    name: string | null
    image: string | null
  } | null
  currentEnrollment?: {
    class: { name: string } | null
  } | null
}

interface StudentComboboxProps {
  value?: string
  onSelect: (
    studentId: string,
    studentName: string,
    studentImage?: string,
  ) => void
  placeholder?: string
  disabled?: boolean
  classId?: string
}

export function StudentCombobox({
  value,
  onSelect,
  placeholder,
  disabled,
  classId,
}: StudentComboboxProps) {
  const t = useTranslations()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['students-combobox', search, classId],
    queryFn: async () => {
      const result = await getStudents({
        data: {
          search: search || undefined,
          status: 'active',
          classId: classId || undefined,
          page: 1,
          limit: 50,
        },
      })
      return result.data.map((item) => {
        const className = [
          item.currentClass.gradeName,
          item.currentClass.section,
        ]
          .filter(Boolean)
          .join(' ')
        return {
          id: item.student.id,
          matricule: item.student.matricule,
          user: {
            name: `${item.student.firstName} ${item.student.lastName}`,
            image: item.student.photoUrl,
          },
          currentEnrollment: item.currentClass
            ? { class: { name: className } }
            : null,
        }
      }) as Student[]
    },
  })

  const students = data ?? []
  const selectedStudent = students.find(s => s.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls="student-combobox-list"
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            {selectedStudent
              ? (
                  <span className="truncate">
                    {selectedStudent.user?.name ?? 'Unknown'}
                    {selectedStudent.matricule && (
                      <span className="ml-2 text-muted-foreground">
                        (
                        {selectedStudent.matricule}
                        )
                      </span>
                    )}
                  </span>
                )
              : (
                  <span className="text-muted-foreground">
                    {placeholder ?? t.attendance.selectStudent()}
                  </span>
                )}
            <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      />
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t.attendance.searchStudent()}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList id="student-combobox-list">
            {isLoading
              ? (
                  <div className="flex items-center justify-center py-6">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  </div>
                )
              : students.length === 0
                ? (
                    <CommandEmpty>{t.students.noStudents()}</CommandEmpty>
                  )
                : (
                    <CommandGroup>
                      {students.map(student => (
                        <CommandItem
                          key={student.id}
                          value={student.id}
                          onSelect={() => {
                            onSelect(
                              student.id,
                              student.user?.name ?? 'Unknown',
                              student.user?.image ?? undefined,
                            )
                            setOpen(false)
                          }}
                        >
                          <IconCheck
                            className={cn(
                              'mr-2 h-4 w-4',
                              value === student.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{student.user?.name ?? 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">
                              {student.matricule}
                              {student.currentEnrollment?.class?.name && (
                                <>
                                  {' '}
                                  •
                                  {student.currentEnrollment.class.name}
                                </>
                              )}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
