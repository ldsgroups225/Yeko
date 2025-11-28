import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { RoleForm } from '@/components/hr/roles/role-form';
import { useTranslation } from 'react-i18next';
import { createNewRole } from '@/school/functions/roles';
import { toast } from 'sonner';

export const Route = createFileRoute('/_auth/app/hr/roles/new')({
  component: NewRolePage,
});

function NewRolePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      const result = await createNewRole({ data });
      toast.success(t('hr.roles.createSuccess'));
      navigate({ to: '/app/hr/roles/$roleId', params: { roleId: result.id } });
    } catch (error) {
      toast.error(t('hr.roles.createError'));
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/app/hr' },
          { label: t('hr.roles.title'), href: '/app/hr/roles' },
          { label: t('hr.roles.addRole') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('hr.roles.addRole')}</h1>
        <p className="text-muted-foreground">{t('hr.roles.createDescription')}</p>
      </div>

      <RoleForm onSubmit={handleSubmit} />
    </div>
  );
}
