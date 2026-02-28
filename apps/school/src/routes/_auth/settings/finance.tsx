import type { WizardStep } from '@/components/finance/accounting-wizard'
import {
  IconArrowRight,
  IconBuilding,
  IconCalendar,
  IconFileText,
  IconLayoutGrid,
  IconReceipt,
  IconRocket,
  IconTag,
} from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useState } from 'react'
import { AccountingWizard } from '@/components/finance/accounting-wizard'
import { WizardStep0 } from '@/components/finance/wizard-steps/step-0'
import { WizardStep1 } from '@/components/finance/wizard-steps/step-1'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/settings/finance')({
  component: AccountingSetupPage,
})

function AccountingSetupPage() {
  const t = useTranslations()
  const [wizardOpen, setWizardOpen] = useState(false)

  const steps: WizardStep[] = [
    {
      title: t.finance.wizard.steps.step0(),
      description: t.finance.wizard.steps.step0Description(),
      component: <WizardStep0 />,
    },
    {
      title: t.finance.wizard.steps.step1(),
      description: t.finance.wizard.steps.step1Description(),
      component: <WizardStep1 />,
    },
    {
      title: t.finance.wizard.steps.step2(),
      description: t.finance.wizard.steps.step2Description(),
      component: (
        <div className="
          bg-muted/50 border-border/60 rounded-xl border border-dashed p-4
        "
        >
          <p className="text-center text-sm italic">...</p>
        </div>
      ),
    },
    {
      title: t.finance.wizard.steps.step3(),
      description: t.finance.wizard.steps.step3Description(),
      component: (
        <div className="
          bg-muted/50 border-border/60 rounded-xl border border-dashed p-4
        "
        >
          <p className="text-center text-sm italic">...</p>
        </div>
      ),
    },
    {
      title: t.finance.wizard.steps.step4(),
      description: t.finance.wizard.steps.step4Description(),
      component: (
        <div className="
          bg-muted/50 border-border/60 rounded-xl border border-dashed p-4
        "
        >
          <p className="text-center text-sm italic">...</p>
        </div>
      ),
    },
    {
      title: t.finance.wizard.steps.step5(),
      description: t.finance.wizard.steps.step5Description(),
      component: (
        <div className="
          bg-muted/50 border-border/60 rounded-xl border border-dashed p-4
        "
        >
          <p className="text-center text-sm italic">...</p>
        </div>
      ),
    },
    {
      title: t.finance.wizard.steps.step6(),
      description: t.finance.wizard.steps.step6Description(),
      component: (
        <div className="
          bg-muted/50 border-border/60 rounded-xl border border-dashed p-4
        "
        >
          <p className="text-center text-sm italic">...</p>
        </div>
      ),
    },
  ]

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col gap-8">
        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            onClick={() => setWizardOpen(true)}
            className="
              shadow-primary/20 gap-2 rounded-2xl px-8 shadow-xl
              transition-transform
              hover:scale-[1.02]
            "
          >
            <IconRocket className="h-5 w-5" />
            {t.finance.wizard.launchWizard()}
          </Button>
        </div>

        <div className="
          grid grid-cols-1 gap-6
          md:grid-cols-2
          lg:grid-cols-3
        "
        >
          <SetupCard
            step="1"
            title={t.finance.wizard.cards.step1Title()}
            description={t.finance.wizard.cards.step1Description()}
            icon={<IconBuilding className="h-6 w-6" />}
            href="/accounting/accounts"
          />
          <SetupCard
            step="2"
            title={t.finance.wizard.cards.step2Title()}
            description={t.finance.wizard.cards.step2Description()}
            icon={<IconCalendar className="h-6 w-6" />}
            href="/accounting/fiscal-years"
          />
          <SetupCard
            step="3"
            title={t.finance.wizard.cards.step3Title()}
            description={t.finance.wizard.cards.step3Description()}
            icon={<IconReceipt className="h-6 w-6" />}
            href="/accounting/fee-types"
          />
          <SetupCard
            step="4"
            title={t.finance.wizard.cards.step4Title()}
            description={t.finance.wizard.cards.step4Description()}
            icon={<IconLayoutGrid className="h-6 w-6" />}
            href="/accounting/fee-structures"
          />
          <SetupCard
            step="5"
            title={t.finance.wizard.cards.step5Title()}
            description={t.finance.wizard.cards.step5Description()}
            icon={<IconTag className="h-6 w-6" />}
            href="/accounting/discounts"
          />
          <SetupCard
            step="6"
            title={t.finance.wizard.cards.step6Title()}
            description={t.finance.wizard.cards.step6Description()}
            icon={<IconFileText className="h-6 w-6" />}
            href="/accounting/payment-plan-templates"
          />
        </div>
      </div>

      <AccountingWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        steps={steps}
      />
    </div>
  )
}

function SetupCard({ step, title, description, icon, href }: { step: string, title: string, description: string, icon: React.ReactNode, href: string }) {
  const t = useTranslations()

  return (
    <Card className="
      border-border/40 bg-card/50
      hover:bg-card/80
      group rounded-3xl border backdrop-blur-sm transition-colors
    "
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="
          bg-muted text-muted-foreground
          group-hover:bg-primary/10 group-hover:text-primary
          flex h-12 w-12 items-center justify-center rounded-2xl
          transition-colors
        "
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="
            text-primary mb-0.5 text-xs font-bold tracking-wider uppercase
          "
          >
            {t.finance.wizard.cards.stepLabel()}
            {' '}
            {step}
          </div>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
        <Link
          to={href}
          className={cn(buttonVariants({ variant: 'ghost' }), `
            hover:bg-primary/5 hover:text-primary
            w-full justify-between rounded-xl
          `)}
        >
          {t.finance.wizard.manage()}
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
