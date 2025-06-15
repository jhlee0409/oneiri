import AuthGuard from "@/app/components/auth-guard";
import DreamJournal from "../../components/dream-journal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "나의 꿈 서재",
  description:
    "당신이 기록한 모든 꿈 이야기를 한 곳에서 만나보세요. 시간이 지나도 사라지지 않는 당신만의 꿈 도서관입니다.",
  openGraph: {
    title: "나의 꿈 서재 - Oneiri",
    description: "당신의 꿈 이야기가 모인 특별한 공간입니다.",
    url: "https://www.oneiri.app/library/dreams",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function DreamLibraryPage() {
  return (
    <AuthGuard>
      <DreamJournal />
    </AuthGuard>
  );
}
