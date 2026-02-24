import type { TeacherAttendanceEntry, TeacherAttendanceStatus } from './types'
import { ConfirmationDialog } from '@workspace/ui/components/confirmation-dialog'
import { useMemo, useState } from 'react'
import { useTranslations } from '@/i18n'
import { TeacherAttendanceContext } from './teacher-attendance-context'

interface TeacherAttendanceProviderProps {
  children: React.ReactNode
  entries: TeacherAttendanceEntry[]
  onSave: (entries: TeacherAttendanceEntry[]) => void
  isSaving?: boolean
}

export function TeacherAttendanceProvider({
  children,
  entries: initialEntries,
  onSave,
  isSaving = false,
}: TeacherAttendanceProviderProps) {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [entries, setEntries] = useState<TeacherAttendanceEntry[]>(initialEntries)
  const [hasChanges, setHasChanges] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleStatusChange = (teacherId: string, status: TeacherAttendanceStatus) => {
    setEntries(prev => prev.map(e => (e.teacherId === teacherId ? { ...e, status } : e)))
    setHasChanges(true)
  }

  const handleNotesChange = (teacherId: string, notes: string) => {
    setEntries(prev => prev.map(e => (e.teacherId === teacherId ? { ...e, notes } : e)))
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
      e.teacherName.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [entries, searchQuery])

  const summary = useMemo(() => ({
    present: entries.filter(e => e.status === 'present').length,
    late: entries.filter(e => e.status === 'late').length,
    absent: entries.filter(e => e.status === 'absent').length,
    excused: entries.filter(e => e.status === 'excused').length,
  }), [entries])

  return (
    <TeacherAttendanceContext
      value={{
        state: {
          entries,
          filteredEntries,
          searchQuery,
          hasChanges,
          isSaving,
          summary,
        },
        actions: {
          setSearchQuery,
          handleStatusChange,
          handleNotesChange,
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
    </TeacherAttendanceContext>
  )
}
