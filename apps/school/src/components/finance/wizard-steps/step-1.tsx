import { IconBuilding, IconCircleCheck, IconCircleX, IconExternalLink } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { buttonVariants } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'
import { accountsOptions } from '@/lib/queries/accounts'
import { cn } from '@/lib/utils'

export function WizardStep1() {
  const t = useTranslations()
  const { data: accounts } = useSuspenseQuery(accountsOptions.list())

  const requiredAccounts = [
    { code: '701', label: t.finance.wizard.steps.step1RevenueLabel(), pattern: /^701/ },
    { code: '411', label: t.finance.wizard.steps.step1ReceivableLabel(), pattern: /^411/ },
    { code: '521', label: t.finance.wizard.steps.step1TreasuryLabel(), pattern: /^5[2-7]/ },
  ]

  const checkAccount = (pattern: RegExp) => Array.isArray(accounts) && accounts.some(a => pattern.test(a.code))

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {requiredAccounts.map((req) => {
          const exists = checkAccount(req.pattern)
          return (
            <div
              key={req.code}
              className={cn(
                'p-4 rounded-xl border flex items-center justify-between transition-colors',
                exists
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-destructive/5 border-destructive/20',
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center',
                  exists ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive',
                )}
                >
                  {exists ? <IconCircleCheck className="h-5 w-5" /> : <IconCircleX className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm">
                    {req.code}
                    {' '}
                    -
                    {' '}
                    {req.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {exists ? t.finance.wizard.steps.step1AccountConfigured() : t.finance.wizard.steps.step1AccountMissing()}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-6 rounded-2xl bg-muted/30 border border-border/40 space-y-4">
        <div className="flex items-start gap-3">
          <IconBuilding className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">{t.finance.wizard.steps.step1ChartOfAccounts()}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.finance.wizard.steps.step1ChartExplanation()}
            </p>
          </div>
        </div>

        <Link
          to="/accounting/accounts"
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full rounded-xl gap-2')}
          target="_blank"
        >
          {t.finance.wizard.steps.step1ManageAccounts()}
          <IconExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
