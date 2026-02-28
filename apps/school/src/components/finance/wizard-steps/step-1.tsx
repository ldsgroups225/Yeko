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
                `
                  flex items-center justify-between rounded-xl border p-4
                  transition-colors
                `,
                exists
                  ? 'border-green-500/20 bg-green-500/5'
                  : 'bg-destructive/5 border-destructive/20',
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  exists
                    ? 'bg-green-500/10 text-green-600'
                    : `bg-destructive/10 text-destructive`,
                )}
                >
                  {exists
                    ? <IconCircleCheck className="h-5 w-5" />
                    : (
                        <IconCircleX className="h-5 w-5" />
                      )}
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {req.code}
                    {' '}
                    -
                    {' '}
                    {req.label}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {exists ? t.finance.wizard.steps.step1AccountConfigured() : t.finance.wizard.steps.step1AccountMissing()}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="
        bg-muted/30 border-border/40 space-y-4 rounded-2xl border p-6
      "
      >
        <div className="flex items-start gap-3">
          <IconBuilding className="text-primary mt-0.5 h-5 w-5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">{t.finance.wizard.steps.step1ChartOfAccounts()}</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t.finance.wizard.steps.step1ChartExplanation()}
            </p>
          </div>
        </div>

        <Link
          to="/accounting/accounts"
          className={cn(buttonVariants({ variant: 'outline' }), `
            w-full gap-2 rounded-xl
          `)}
          target="_blank"
        >
          {t.finance.wizard.steps.step1ManageAccounts()}
          <IconExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
