import { IconArrowRight, IconSparkles } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-secondary/10" />

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
            <IconSparkles className="h-4 w-4" />
            <span>Join 200+ Schools Already Using Yeko</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your School?
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Start your free 30-day trial today. No credit card required.
            Experience the difference in less than a week.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              className="group h-14 px-8 text-lg"
              render={(
                <a href="/signup">
                  Start Free Trial Now
                  <IconArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              )}
            />
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg"
              render={<Link to="/demo-request">Talk to Sales</Link>}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Setup in 5 days • Free onboarding & training • Cancel anytime
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    </section>
  )
}
