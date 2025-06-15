import DreamShared from "../components/dream-shared";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공유된 꿈들",
  description:
    "다른 사람들이 공유한 아름다운 꿈의 이야기를 만나보세요. 매일 새로운 꿈들이 공개되며, 무의식이 만든 신비로운 세계를 함께 탐험할 수 있습니다.",
  openGraph: {
    title: "공유된 꿈들 - Oneiri",
    description:
      "사람들이 공유한 꿈 이야기의 세계로 초대합니다. 다양한 꿈들을 읽고 영감을 얻어보세요.",
    url: "https://www.oneiri.app/shared",
  },
  alternates: {
    canonical: "https://www.oneiri.app/shared",
  },
};

export default function SharedPage() {
  return <DreamShared />;
}
