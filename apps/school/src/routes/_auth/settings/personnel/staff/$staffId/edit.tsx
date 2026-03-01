import type { StaffPosition, UpdateStaffData } from '@/schemas/staff'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { StaffForm } from '@/components/hr/staff/staff-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { getStaffMember, updateExistingStaff } from '@/school/functions/staff'

export const Route = createFileRoute('/_auth/settings/personnel/staff/$staffId/edit')({
  component: EditStaffPage,
  loader: async ({ params }) => {
    return await getStaffMember({ data: params.staffId })
  },
})

function EditStaffPage() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { staffId } = Route.useParams()
  const staffData = Route.useLoaderData()

  const { data: staffResult } = useSuspenseQuery({
    queryKey: ['staff', staffId],
    queryFn: () => getStaffMember({ data: staffId }),
    initialData: staffData,
  })

  const staff = staffResult?.success ? staffResult.data : null

  const handleSubmit = async (data: UpdateStaffData) => {
    try {
      await updateExistingStaff({ data: { staffId, data } })
      toast.success(t.hr.staff.updateSuccess())
      navigate({ to: '/settings/personnel/staff/$staffId', params: { staffId } })
    }
    catch (error) {
      toast.error(t.hr.staff.updateError())
      throw error
    }
  }

  if (!staff) {
    return <div>{t.hr.staff.notFound()}</div>
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.settings(), href: '/settings' },
          { label: t.sidebar.personnel(), href: '/settings/personnel' },
          { label: t.hr.staff.title(), href: '/settings/personnel/staff' },
          { label: staff.position, href: `/settings/personnel/staff/${staffId}` },
          { label: t.common.edit() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.hr.staff.editStaff()}</h1>
        <p className="text-muted-foreground">{t.hr.staff.editDescription()}</p>
      </div>

      <StaffForm
        initialData={{
          ...staff,
          position: staff.position as StaffPosition,
          department: staff.department ?? undefined,
          hireDate: staff.hireDate ? new Date(staff.hireDate) : undefined,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
