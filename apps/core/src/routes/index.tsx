import { createFileRoute } from "@tanstack/react-router";
import { NavigationBar } from "@/components/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { PainPointsSection } from "@/components/landing/pain-points-section";
import { WhyYekoSection } from "@/components/landing/why-yeko-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
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
  );
}
