import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { UserForm } from '@/components/hr/users/user-form';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_auth/app/hr/users/new')({
  component: NewUserPage,
});

function NewUserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate({ to: '/app/hr/users', search: { page: 1 } });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/app/hr' },
          { label: t('hr.users.title'), href: '/app/hr/users' },
          { label: t('hr.users.addUser') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('hr.users.addUser')}</h1>
        <p className="text-muted-foreground">{t('hr.users.addUserDescription')}</p>
      </div>

      <UserForm onSuccess={handleSuccess} />
    </div>
  );
}
