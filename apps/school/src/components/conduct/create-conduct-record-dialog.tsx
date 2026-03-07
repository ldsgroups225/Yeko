import type { ConductRecordFormData } from './conduct-record-schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { conductRecordsKeys } from '@/lib/queries/conduct-records'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { createRecord } from '@/school/functions/conduct-records'
import { ConductRecordForm } from './conduct-record-form'

interface CreateConductRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolYearId?: string | null
  studentId?: string
  studentName?: string
}

export function CreateConductRecordDialog({
  open,
  onOpenChange,
  schoolYearId,
  studentId,
  studentName,
}: CreateConductRecordDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: schoolMutationKeys.conductRecords.create,
    mutationFn: async (payload: Parameters<typeof createRecord>[0]) => {
      const result = await createRecord(payload)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: conductRecordsKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['conduct-records'] }),
      ])
      toast.success(t.conduct.created(), {
        className: 'rounded-2xl border-border/40 bg-background/80 font-bold backdrop-blur-xl',
      })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t.conduct.createFailed())
    },
  })

  const handleSubmit = (data: ConductRecordFormData) => {
    if (!schoolYearId) {
      toast.error(t.classes.noSchoolYear())
      return
    }

    mutation.mutate({
      data: {
        studentId: data.studentId,
        schoolYearId,
        type: data.type,
        category: data.category!,
        title: data.title!,
        description: data.description,
        severity: data.severity,
        incidentDate: data.incidentDate?.toISOString().split('T')[0],
        incidentTime: data.incidentTime,
        location: data.location,
        witnesses: data.witnesses?.split(',').map(w => w.trim()).filter(Boolean),
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-[min(720px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] flex-col overflow-hidden overscroll-y-contain rounded-[20px] border border-slate-200 bg-white p-0 shadow-[0_20px_48px_rgba(15,23,42,0.16)] sm:max-w-[720px]">
        <div className="shrink-0 border-b border-slate-100 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-[1.75rem] font-bold tracking-tight text-slate-950 text-balance">
              {t.conduct.newRecord()}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-600">
              {studentName
                ? `${studentName} · ${t.conduct.newRecordDescription()}`
                : t.conduct.newRecordDescription()}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-5 pt-4">
          <ConductRecordForm
            key={studentId ?? 'new-conduct-record'}
            studentId={studentId}
            defaultType="incident"
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={mutation.isPending}
            stickyFooter
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
