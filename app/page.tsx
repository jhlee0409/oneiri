import { HeroSection } from "@/components/hero-section";
import { EmpathySection } from "@/components/empathy-section";
import { SolutionSection } from "@/components/solution-section";
import { ShowcaseSection } from "@/components/showcase-section";
import { FinalCTASection } from "@/components/final-cta-section";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oneiri - 꿈이 이야기가 되는 곳",
  description:
    "흩어진 꿈 조각을 AI가 아름다운 이야기로 재탄생시킵니다. 매일 밤 꾸는 꿈을 기록하고, 신비로운 이야기로 만들어보세요. 당신의 무의식이 들려주는 이야기를 발견하세요.",
  keywords: [
    "꿈 일기",
    "AI 스토리텔링",
    "꿈 해석",
    "창작 이야기",
    "꿈 기록",
    "AI 글쓰기",
    "무의식 탐구",
    "드림 저널",
  ],
  openGraph: {
    title: "Oneiri - 꿈이 이야기가 되는 곳",
    description:
      "흩어진 꿈 조각을 AI가 아름다운 이야기로 재탄생시킵니다. 당신만의 꿈 도서관을 만들어보세요.",
    type: "website",
    url: "https://www.oneiri.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Oneiri - 꿈이 이야기가 되는 곳",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oneiri - 꿈이 이야기가 되는 곳",
    description: "흩어진 꿈 조각을 AI가 아름다운 이야기로 재탄생시킵니다.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://www.oneiri.app",
  },
};

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
