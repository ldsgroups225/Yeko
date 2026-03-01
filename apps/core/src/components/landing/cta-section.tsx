import { IconArrowRight, IconSparkles } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { buttonVariants } from '@workspace/ui/components/button'

export function CTASection() {
  return (
    <section className="
      relative overflow-hidden py-24
      sm:py-32
    "
    >
      {/* Background gradient */}
      <div className="
        from-primary/10 via-background to-secondary/10 absolute inset-0
        bg-linear-to-br
      "
      />

      <div className="
        relative mx-auto max-w-4xl px-6
        lg:px-8
      "
      >
        <div className="text-center">
          <div className="
            bg-primary/10 text-primary mb-6 inline-flex items-center gap-2
            rounded-full px-4 py-2 font-medium
          "
          >
            <IconSparkles className="h-4 w-4" />
            <span>Join 200+ Schools Already Using Yeko</span>
          </div>

          <h2 className="
            mb-6 text-4xl font-bold
            md:text-5xl
          "
          >
            Ready to Transform Your School?
          </h2>

          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-xl">
            Start your free 30-day trial today. No credit card required.
            Experience the difference in less than a week.
          </p>

          <div className="
            mb-8 flex flex-col items-center justify-center gap-4
            sm:flex-row
          "
          >
            <a
              href="/signup"
              className={buttonVariants({ size: 'lg', className: 'group h-14 px-8 text-lg' })}
            >
              Start Free Trial Now
              <IconArrowRight className="
                ml-2 h-5 w-5 transition-transform
                group-hover:translate-x-1
              "
              />
            </a>
            <Link
              to="/demo-request"
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'h-14 px-8 text-lg' })}
            >
              Talk to Sales
            </Link>
          </div>

          <p className="text-muted-foreground text-sm">
            Setup in 5 days • Free onboarding & training • Cancel anytime
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="
        bg-primary/5 absolute top-1/2 left-0 h-96 w-96 -translate-x-1/2
        -translate-y-1/2 rounded-full blur-3xl
      "
      />
      <div className="
        bg-secondary/5 absolute top-1/2 right-0 h-96 w-96 translate-x-1/2
        -translate-y-1/2 rounded-full blur-3xl
      "
      />
    </section>
  )
}
