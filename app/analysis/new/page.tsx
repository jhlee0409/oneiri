import type { Metadata } from "next";
import NewAnalysisClient from "./new-analysis-client";

export const metadata: Metadata = {
  title: "꿈 분석",
  description:
    "전문적인 심리학적 관점에서 당신의 꿈을 분석합니다. 꿈의 상징과 무의식의 메시지를 깊이 있게 탐구해보세요.",
  openGraph: {
    title: "꿈 분석 - Oneiri",
    description:
      "AI가 당신의 꿈을 심리학적으로 분석하여 숨겨진 의미를 찾아드립니다.",
    url: "https://www.oneiri.app/analysis/new",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function NewAnalysisPage() {
  return <NewAnalysisClient />;
}
