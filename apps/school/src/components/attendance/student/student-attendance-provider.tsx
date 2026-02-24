import type { StudentAttendanceEntry, StudentAttendanceStatus } from './types'
import { ConfirmationDialog } from '@workspace/ui/components/confirmation-dialog'
import { useMemo, useState } from 'react'
import { useTranslations } from '@/i18n'
import { StudentAttendanceContext } from './student-attendance-context'

interface StudentAttendanceProviderProps {
  children: React.ReactNode
  className: string
  entries: StudentAttendanceEntry[]
  onSave: (entries: StudentAttendanceEntry[]) => void
  isSaving?: boolean
}

export function StudentAttendanceProvider({
  children,
  className,
  entries: initialEntries,
  onSave,
  isSaving = false,
}: StudentAttendanceProviderProps) {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [entries, setEntries] = useState<StudentAttendanceEntry[]>(initialEntries)
  const [hasChanges, setHasChanges] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleStatusChange = (studentId: string, status: StudentAttendanceStatus) => {
    setEntries(prev => prev.map(e => (e.studentId === studentId ? { ...e, status } : e)))
    setHasChanges(true)
  }

  const handleMarkAllPresent = () => {
    setEntries(prev => prev.map(e => ({ ...e, status: 'present' as const })))
    setHasChanges(true)
  }

  const onConfirmSave = () => {
    onSave(entries)
    setHasChanges(false)
    setShowConfirm(false)
  }

  const filteredEntries = useMemo(() => {
    return entries.filter(e =>
      e.studentName.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [entries, searchQuery])

  const summary = useMemo(() => ({
    present: entries.filter(e => e.status === 'present').length,
    late: entries.filter(e => e.status === 'late').length,
    absent: entries.filter(e => e.status === 'absent').length,
    excused: entries.filter(e => e.status === 'excused').length,
  }), [entries])

  return (
    <StudentAttendanceContext
      value={{
        state: {
          entries,
          filteredEntries,
          searchQuery,
          hasChanges,
          isSaving,
          className,
          summary,
        },
        actions: {
          setSearchQuery,
          handleStatusChange,
          handleMarkAllPresent,
          handleSave: () => setShowConfirm(true),
        },
      }}
    >
      {children}
      <ConfirmationDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={t.attendance.save()}
        description={t.attendance.saveConfirmDescription()}
        onConfirm={onConfirmSave}
        isPending={isSaving}
        confirmLabel={t.common.save()}
      />
    </StudentAttendanceContext>
  )
}
