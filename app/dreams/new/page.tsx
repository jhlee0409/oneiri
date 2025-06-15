import AuthGuard from "@/app/components/auth-guard";
import DreamForm from "@/app/components/dream-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "새로운 꿈 기록",
  description:
    "오늘 밤 꾼 꿈을 기록하고 AI가 만들어주는 아름다운 이야기로 변환해보세요. 당신의 무의식이 들려주는 이야기를 발견하세요.",
  openGraph: {
    title: "새로운 꿈 기록 - Oneiri",
    description: "꿈의 조각들을 모아 특별한 이야기로 만들어보세요.",
    url: "https://www.oneiri.app/dreams/new",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen oneiri-bg-primary">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <header className="text-center mb-8 sm:mb-12">
            <h1 className="font-['Inter'] text-2xl sm:text-4xl md:text-5xl font-medium oneiri-accent mb-3 sm:mb-4">
              오늘의 꿈 조각
            </h1>
            <p className="oneiri-text-primary text-base sm:text-lg mb-2">
              어떤 꿈의 조각들을 가져오셨나요?
            </p>
            <p className="oneiri-text-secondary text-xs sm:text-sm">
              안개 낀 숲, 낯선 속삭임, 알 수 없는 그리움처럼… 떠오르는 모든 것이
              특별한 이야기가 됩니다 ✨
            </p>
          </header>

          <DreamForm />
        </div>
      </div>
    </AuthGuard>
  );
}
