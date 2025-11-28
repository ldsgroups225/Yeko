import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { TeacherForm } from '@/components/hr/teachers/teacher-form';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_auth/app/hr/teachers/new')({
  component: NewTeacherPage,
});

function NewTeacherPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate({ to: '/app/hr/teachers', search: { page: 1 } });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/app/hr' },
          { label: t('hr.teachers.title'), href: '/app/hr/teachers' },
          { label: t('hr.teachers.addTeacher') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('hr.teachers.addTeacher')}</h1>
        <p className="text-muted-foreground">{t('hr.teachers.addTeacherDescription')}</p>
      </div>

      <TeacherForm onSuccess={handleSuccess} />
    </div>
  );
}
