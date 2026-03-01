import { IconPlus } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { buttonVariants } from '@workspace/ui/components/button'
import { z } from 'zod'
import { FinanceSubpageToolbar } from '@/components/finance/finance-subpage-toolbar'
import { StaffTable } from '@/components/hr/staff/staff-table'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

const staffSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  search: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
})

export const Route = createFileRoute('/_auth/settings/personnel/staff/')({
  component: StaffListPage,
  validateSearch: staffSearchSchema,
})

function StaffListPage() {
  const t = useTranslations()
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <FinanceSubpageToolbar
        backTo="/settings/personnel"
        actions={(
          <Link
            to="/settings/personnel/staff/new"
            className={cn(buttonVariants({ size: 'sm' }), 'rounded-xl')}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            {t.hr.staff.addStaff()}
          </Link>
        )}
      />

      <StaffTable filters={search} />
    </div>
  )
}
