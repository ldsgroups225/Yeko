import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { TeacherForm } from '@/components/hr/teachers/teacher-form';
import { getTeacher } from '@/school/functions/teachers';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_auth/app/hr/teachers/$teacherId/edit')({
  component: EditTeacherPage,
});

function EditTeacherPage() {
  const { teacherId } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: async () => {
      const result = await getTeacher({ data: teacherId });
      return result;
    },
  });

  const handleSuccess = () => {
    navigate({ to: `/app/hr/teachers/${teacherId}` });
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
          { label: t('hr.teachers.title'), href: '/app/hr/teachers' },
          {
            label: teacher?.user?.name || teacherId,
            href: `/app/hr/teachers/${teacherId}`,
          },
          { label: t('hr.teachers.editTeacher') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('hr.teachers.editTeacher')}</h1>
        <p className="text-muted-foreground">{t('hr.teachers.editTeacherDescription')}</p>
      </div>

      {teacher && <TeacherForm teacher={teacher} onSuccess={handleSuccess} />}
    </div>
  );
}
