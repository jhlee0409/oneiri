import { Button } from "@/components/ui/button";
import { Library, Moon, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative h-screen bg-navy-900">
      {/* 🔹 배경 영상 */}
      <video
        src="/videos/hero-section-long.webm"
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 🔹 어두운 오버레이 (선택) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80 z-0" />

      {/* 🔹 중앙 정렬된 텍스트 & CTA */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif font-bold text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-display text-slate-100 mb-4 sm:mb-6 md:mb-8 leading-tight">
          어젯밤 꾼 꿈, 어떤 운명의 조각이 될까요?
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-body-large text-slate-100 mb-8 sm:mb-12 md:mb-16 lg:mb-20 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-4 font-normal">
          AI가 당신의 꿈을 듣고, 감정과 상징을 읽어
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          하나의 이야기 또는 해석으로 만들어드립니다.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:w-auto">
          {/* CTA Buttons */}
          <Link href="/dreams/new">
            <Button
              variant="outline"
              className="w-full sm:w-auto inline-flex items-center justify-center
               text-sm sm:text-base md:text-label
               px-6 sm:px-8 py-3 sm:py-4 h-auto
               border-gold-500 text-slate-100 bg-gold-500
               hover:bg-gold-600 hover:text-navy-900
               transition-all duration-800 animate-float
               sm:min-w-[260px]"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />내 꿈
              이야기 만들어보기
            </Button>
          </Link>
          <Link href="/analysis/new">
            <Button
              variant="outline"
              className="w-full sm:w-auto inline-flex items-center justify-center
               text-sm sm:text-base md:text-label
               px-6 sm:px-8 py-3 sm:py-4 h-auto
               border-navy-700 text-navy-100 bg-navy-800
               hover:bg-navy-700 hover:text-white
               transition-all duration-800 animate-float
               sm:min-w-[260px]"
            >
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />내 꿈 해석
              받아보기
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
