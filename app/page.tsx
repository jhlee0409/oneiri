import { HeroSection } from "@/components/hero-section";
import { EmpathySection } from "@/components/empathy-section";
import { SolutionSection } from "@/components/solution-section";
import { ShowcaseSection } from "@/components/showcase-section";
import { FinalCTASection } from "@/components/final-cta-section";
import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;
  return (
    <>
      <HeroSection key="hero" />
      <EmpathySection key="empathy" />
      <SolutionSection key="solution" />
      <ShowcaseSection key="showcase" isLoggedIn={isLoggedIn} />
      <FinalCTASection key="cta" />
    </>
  );
}
