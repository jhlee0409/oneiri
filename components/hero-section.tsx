import Link from "next/link";
import { DREAM_PAGE_SVG } from "@/app/components/dream-postcard-sample";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden oneiri-bg-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(212,175,55,0.10),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:pb-24 md:pt-20">
        <div className="max-w-xl">
          <h1 className="font-serif text-[2rem] font-bold leading-[1.3] tracking-[-0.01em] oneiri-text-primary break-keep sm:text-5xl sm:leading-[1.25]">
            어젯밤 꿈, 흐려지기 전에
            <br />
            한 편의 이야기로 남겨요
          </h1>
          <p className="mt-5 text-base leading-relaxed oneiri-text-secondary break-keep sm:text-lg">
            기억나는 장면 한 줄이면 충분해요. 로그인 없이 바로 짧은 이야기로 엮어 드리고,
            서재에 담으면 장면 그림도 함께 그려져요.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Link
              href="/dreams/new"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg oneiri-accent-bg px-7 font-medium text-bg-primary transition-[filter,transform] duration-200 hover:brightness-110 active:translate-y-px sm:w-auto"
            >
              로그인 없이 꿈 적어보기
            </Link>
            <Link
              href="/dreams"
              className="inline-flex min-h-11 items-center text-sm oneiri-text-secondary underline-offset-4 hover:oneiri-text-primary hover:underline"
            >
              다른 사람들의 꿈 구경하기
            </Link>
          </div>
        </div>

        <figure className="mx-auto w-full max-w-[22rem] md:max-w-sm">
          <div
            className="overflow-hidden rounded-sm shadow-[0_32px_64px_-24px_rgba(0,0,0,0.7)] [transform:rotate(1.5deg)] [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: DREAM_PAGE_SVG }}
          />
          <figcaption className="mt-4 text-center text-xs oneiri-text-secondary">
            꿈 한 줄이 이렇게 서재의 한 페이지가 돼요 · 견본
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
