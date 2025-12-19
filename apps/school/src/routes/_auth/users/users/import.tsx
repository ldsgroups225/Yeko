import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BulkImportUsers } from '@/components/hr/users/bulk-import-users'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export const Route = createFileRoute('/_auth/users/users/import')({
  component: ImportUsersPage,
})

function ImportUsersPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/users' },
          { label: t('hr.users.title'), href: '/users/users' },
          { label: t('hr.users.bulkImport') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('hr.users.bulkImport')}</h1>
        <p className="text-muted-foreground">{t('hr.users.bulkImportDescription')}</p>
      </div>

      <BulkImportUsers />
    </div>
  )
}
