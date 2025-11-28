import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { UserForm } from '@/components/hr/users/user-form';
import { getUser } from '@/school/functions/users';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_auth/app/hr/users/$userId/edit')({
  component: EditUserPage,
});

function EditUserPage() {
  const { userId } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const result = await getUser({ data: userId });
      return result;
    },
  });

  const handleSuccess = () => {
    navigate({ to: `/app/hr/users/${userId}` });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/app/hr' },
          { label: t('hr.users.title'), href: '/app/hr/users' },
          { label: user?.name || userId, href: `/app/hr/users/${userId}` },
          { label: t('hr.users.editUser') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('hr.users.editUser')}</h1>
        <p className="text-muted-foreground">{t('hr.users.editUserDescription')}</p>
      </div>

      {user && <UserForm user={user} onSuccess={handleSuccess} />}
    </div>
  );
}
