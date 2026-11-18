import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] oneiri-bg-primary flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-sm tracking-widest oneiri-text-secondary">404</p>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold oneiri-text-primary break-keep leading-snug">
          이 페이지는 꿈처럼 흩어졌어요
        </h1>
        <p className="oneiri-text-secondary text-sm sm:text-base break-keep">
          주소가 바뀌었거나 더는 없는 페이지예요.
        </p>
        <div className="flex flex-col items-center gap-3 pt-2">
          <Link
            href="/dreams/new"
            className="flex items-center justify-center w-full sm:w-auto min-h-12 px-8 rounded-lg oneiri-accent-bg hover:bg-accent-primary/90 text-bg-primary font-medium transition-colors"
          >
            오늘 꿈 기록하기
          </Link>
          <Link
            href="/library/dreams"
            className="inline-flex items-center min-h-11 px-2 text-sm oneiri-text-secondary underline underline-offset-4 hover:oneiri-text-primary"
          >
            서재로 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
