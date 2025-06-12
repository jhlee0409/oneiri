import { GlobalHeader } from "@/components/global-header";
import { HeroSection } from "@/components/hero-section";
import { EmpathySection } from "@/components/empathy-section";
import { SolutionSection } from "@/components/solution-section";
import { ShowcaseSection } from "@/components/showcase-section";
import { FinalCTASection } from "@/components/final-cta-section";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <EmpathySection />
      <SolutionSection />
      <ShowcaseSection />
      <FinalCTASection />
    </>
  );
}
