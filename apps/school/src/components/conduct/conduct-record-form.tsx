import type { ConductRecordFormData, conductTypes } from './conduct-record-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ConductRecordFormInner } from './conduct-record-form-inner'
import {

  conductRecordFormSchema,

} from './conduct-record-schema'

interface ConductRecordFormProps {
  studentId?: string
  defaultType?: (typeof conductTypes)[number]
  onSubmit: (data: ConductRecordFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ConductRecordForm({
  studentId: initialStudentId,
  defaultType = 'incident',
  onSubmit,
  onCancel,
  isSubmitting,
}: ConductRecordFormProps) {
  const form = useForm<ConductRecordFormData>({
    resolver: zodResolver(conductRecordFormSchema),
    defaultValues: {
      studentId: initialStudentId ?? '',
      type: defaultType,
      category: 'behavior',
      title: '',
      description: '',
    },
  })

  return (
    <ConductRecordFormInner
      form={form}
      initialStudentId={initialStudentId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    />
  )
}
