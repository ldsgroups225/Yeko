import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import { BenefitsSection } from '@/components/landing/benefits-section'
import { CTASection } from '@/components/landing/cta-section'
import { FAQSection } from '@/components/landing/faq-section'
import { Footer } from '@/components/landing/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { PainPointsSection } from '@/components/landing/pain-points-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { SocialProofSection } from '@/components/landing/social-proof-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { UseCasesSection } from '@/components/landing/use-cases-section'
import { WhyYekoSection } from '@/components/landing/why-yeko-section'
import { NavigationBar } from '@/components/navigation'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { logger } = useLogger()

  // Log page view
  React.useEffect(() => {
    logger.info('Landing page viewed', {
      page: 'home',
      timestamp: new Date().toISOString(),
    })

    // Track performance
    const startTime = performance.now()
    return () => {
      const loadTime = performance.now() - startTime
      logger.performance('Landing page load', loadTime, {
        page: 'home',
      })
    }
  }, [logger])

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main>
        <HeroSection />
        <SocialProofSection />
        <div id="solutions">
          <UseCasesSection />
        </div>
        <PainPointsSection />
        <WhyYekoSection />
        <HowItWorksSection />
        <div id="benefits">
          <BenefitsSection />
        </div>
        <div id="pricing">
          <PricingSection />
        </div>
        <TestimonialsSection />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
