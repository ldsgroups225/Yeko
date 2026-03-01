'use client'

import type { Locale } from 'date-fns'
import { IconCalendar } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  captionLayout?: 'label' | 'dropdown'
  locale?: Locale
  /* @default 1, 0 = Sunday, 1 = Monday, etc. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

function DatePicker({
  date,
  onSelect,
  className,
  placeholder = 'Sélectionner une date',
  disabled,
  captionLayout,
  locale = fr,
  weekStartsOn = 1,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={(
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
              className,
            )}
          >
            <IconCalendar className="mr-2 h-4 w-4" />
            {date
              ? (
                  format(date, 'PPP', { locale })
                )
              : (
                  <span>{placeholder}</span>
                )}
          </Button>
        )}
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout={captionLayout}
          selected={date}
          onSelect={onSelect}
          locale={locale}
          weekStartsOn={weekStartsOn}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
