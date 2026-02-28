import { useEffect } from 'react'
import { useLogger } from '@/lib/logger'
import { NavigationBar } from '../navigation'
import { BenefitsSection } from './benefits-section'
import { CTASection } from './cta-section'
import { FAQSection } from './faq-section'
import { Footer } from './footer'
import { HeroSection } from './hero-section'
import { HowItWorksSection } from './how-it-works-section'
import { PainPointsSection } from './pain-points-section'
import { PricingSection } from './pricing-section'
import { SocialProofSection } from './social-proof-section'
import { TestimonialsSection } from './testimonials-section'
import { UseCasesSection } from './use-cases-section'
import { WhyYekoSection } from './why-yeko-section'

export function LandingPage() {
  const { logger } = useLogger()

  // Log page view
  useEffect(() => {
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
    <div className="bg-background min-h-screen">
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
