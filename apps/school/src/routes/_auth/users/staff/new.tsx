import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { StaffForm } from '@/components/hr/staff/staff-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { createNewStaff } from '@/school/functions/staff'

export const Route = createFileRoute('/_auth/users/staff/new')({
  component: NewStaffPage,
})

function NewStaffPage() {
  const t = useTranslations()
  const navigate = useNavigate()

  const handleSubmit = async (data: any) => {
    try {
      const result = await createNewStaff({ data })
      toast.success(t.hr.staff.createSuccess())
      navigate({ to: '/users/staff/$staffId', params: { staffId: result.id } })
    }
    catch (error) {
      toast.error(t.hr.staff.createError())
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.hr.title(), href: '/users' },
          { label: t.hr.staff.title(), href: '/users/staff' },
          { label: t.hr.staff.addStaff() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.hr.staff.addStaff()}</h1>
        <p className="text-muted-foreground">{t.hr.staff.createDescription()}</p>
      </div>

      <StaffForm onSubmit={handleSubmit} />
    </div>
  )
}
