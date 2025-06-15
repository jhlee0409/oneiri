import DreamShared from "../components/dream-shared";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공개된 꿈들",
  description:
    "다른 사람들이 공유한 꿈 이야기를 탐험해보세요. 신비롭고 아름다운 꿈의 세계가 당신을 기다립니다.",
  openGraph: {
    title: "공개된 꿈들 - Oneiri",
    description:
      "사람들이 공유한 꿈 이야기를 읽어보세요. 무의식이 만든 신비로운 세계를 탐험하세요.",
    url: "https://www.oneiri.app/dreams",
  },
  alternates: {
    canonical: "https://www.oneiri.app/dreams",
  },
};

export default function DreamsPage() {
  return <DreamShared />;
}
