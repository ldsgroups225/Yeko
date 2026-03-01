import type { CreateStaffData } from '@/schemas/staff'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { StaffForm } from '@/components/hr/staff/staff-form'
import { useTranslations } from '@/i18n'
import { createNewStaff } from '@/school/functions/staff'

export const Route = createFileRoute('/_auth/settings/personnel/staff/new')({
  component: NewStaffPage,
})

function NewStaffPage() {
  const t = useTranslations()
  const navigate = useNavigate()

  const handleSubmit = async (data: CreateStaffData) => {
    const result = await createNewStaff({ data })
    if (result.success) {
      toast.success(t.hr.staff.createSuccess())
      navigate({ to: '/settings/personnel/staff/$staffId', params: { staffId: result.data?.id ?? '' } })
    }
    else {
      toast.error(result.error || t.hr.staff.createError())
    }
  }

  return (
    <div>
      <StaffForm onSubmit={handleSubmit} />
    </div>
  )
}
