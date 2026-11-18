import DreamShared from "../components/dream-shared";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "둘러보기",
  description: "다른 사람들이 공개한 꿈 이야기를 읽어 보세요.",
  openGraph: {
    title: "둘러보기 - Oneiri",
    description: "다른 사람들이 공개한 꿈 이야기를 읽어 보세요.",
    url: "https://www.oneiri.app/dreams",
  },
  alternates: {
    canonical: "https://www.oneiri.app/dreams",
  },
};

export default function DreamsPage() {
  return <DreamShared />;
}
