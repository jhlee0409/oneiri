import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen h-screen flex items-end bg-navy-900"
      style={{
        backgroundImage: `url('/images/hero-section.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      <div className="grid-oneiri w-full px-4 sm:px-6 lg:px-8">
        <div className="col-span-12 text-center pb-16 sm:pb-20 md:pb-[100px] lg:pb-[120px]">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl lg:text-display text-slate-100 mb-4 sm:mb-6 leading-tight">
            당신의 가장 깊은 곳,
            <br />한 편의 이야기가 됩니다.
          </h1>
          <p className="text-base sm:text-lg md:text-body-large text-slate-100 mb-8 sm:mb-10 md:mb-12 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4">
            Oneiri의 AI는 당신의 무의식이 속삭이는 언어를 탐험하는 여정의
            동반자입니다.
          </p>
          <Button
            variant="outline"
            className="text-sm sm:text-base md:text-label border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-900 px-6 sm:px-8 py-3 sm:py-4 h-auto transition-all duration-800 animate-float"
          >
            첫 꿈 탐험 시작하기
          </Button>
        </div>
      </div>
    </section>
  );
}
