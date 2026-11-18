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
    <div className="min-h-screen oneiri-bg-primary">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-12">
        <header className="mb-4 sm:mb-8">
          {/* 본문 입력칸의 보이는 이름 (dream-form.tsx DREAM_FORM_HEADING_ID) */}
          <h1
            id="dream-form-heading"
            className="font-serif text-2xl sm:text-4xl font-bold oneiri-text-primary"
          >
            어떤 꿈을 꿨나요?
          </h1>
          <p className="mt-1 sm:mt-2 oneiri-text-secondary text-sm sm:text-base break-keep">
            기억나는 대로 적으면 한 편의 이야기로 만들어 드려요.
          </p>
        </header>

        <DreamForm />
      </div>
    </div>
  );
}
