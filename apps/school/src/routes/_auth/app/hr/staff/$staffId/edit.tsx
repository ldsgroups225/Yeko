import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { StaffForm } from '@/components/hr/staff/staff-form';
import { useTranslation } from 'react-i18next';
import { getStaffMember, updateExistingStaff } from '@/school/functions/staff';
import { toast } from 'sonner';
import { useSuspenseQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/app/hr/staff/$staffId/edit')({
  component: EditStaffPage,
  loader: async ({ params }) => {
    return await getStaffMember({ data: params.staffId });
  },
});

function EditStaffPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { staffId } = Route.useParams();
  const staffData = Route.useLoaderData();

  const { data: staff } = useSuspenseQuery({
    queryKey: ['staff', staffId],
    queryFn: () => getStaffMember({ data: staffId }),
    initialData: staffData,
  });

  const handleSubmit = async (data: any) => {
    try {
      await updateExistingStaff({ data: { staffId, data } });
      toast.success(t('hr.staff.updateSuccess'));
      navigate({ to: '/app/hr/staff/$staffId', params: { staffId } });
    } catch (error) {
      toast.error(t('hr.staff.updateError'));
      throw error;
    }
  };

  if (!staff) {
    return <div>{t('hr.staff.notFound')}</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/app/hr' },
          { label: t('hr.staff.title'), href: '/app/hr/staff' },
          { label: staff.position, href: `/app/hr/staff/${staffId}` },
          { label: t('common.edit') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('hr.staff.editStaff')}</h1>
        <p className="text-muted-foreground">{t('hr.staff.editDescription')}</p>
      </div>

      <StaffForm initialData={staff} onSubmit={handleSubmit} />
    </div>
  );
}
