import { createFileRoute } from '@tanstack/react-router'
import { BulkImportUsers } from '@/components/hr/users/bulk-import-users'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/settings/personnel/users/import')({
  component: ImportUsersPage,
})

function ImportUsersPage() {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.settings(), href: '/settings' },
          { label: t.sidebar.personnel(), href: '/settings/personnel' },
          { label: t.hr.users.title(), href: '/settings/personnel/users' },
          { label: t.hr.users.bulkImport() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.hr.users.bulkImport()}</h1>
        <p className="text-muted-foreground">{t.hr.users.bulkImportDescription()}</p>
      </div>

      <BulkImportUsers />
    </div>
  )
}
